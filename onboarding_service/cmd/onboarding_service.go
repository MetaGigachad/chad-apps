package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"log/slog"
	"net/http"
	"strings"

	// "math/rand"
	"os"
	"os/signal"
	"path"

	// "strings"
	"time"

	mylog "github.com/MetaGigachad/chad-apps/onboarding_service/internals/log"

	"database/sql"

	// "github.com/mattn/go-sqlite3"
	_ "github.com/mattn/go-sqlite3"

	"github.com/go-co-op/gocron/v2"
	"github.com/go-telegram/bot"
	"github.com/go-telegram/bot/models"
	"github.com/gookit/config/v2"
	"github.com/gookit/config/v2/yaml"

	ory "github.com/ory/client-go"
)

type Config struct {
	Bot struct {
		Token   string `mapstructure:"token"`
		WebHook struct {
			HostUrl    string `mapstructure:"host_url"`
			ListenHost string `mapstructure:"listen_host"`
			ListenPort string `mapstructure:"listen_port"`
		} `mapstructure:"webhook"`
		AdminIds []int64 `mapstructure:"admin_ids"`
	} `mapstructure:"bot"`
	Database struct {
		Path string `mapstructure:"path"`
	} `mapstructure:"database"`
	HttpAPI struct {
		Host string `mapstructure:"host"`
		Port string `mapstructure:"port"`
	} `mapstructure:"http_api"`
	Ory struct {
		Url string `mapstructure:"url"`
	} `mapstructure:"ory"`
}

var BotUser models.User

type contextKey string

func LoadConfig() Config {
	config.AddDriver(yaml.Driver)
	err := config.LoadFiles("config/app.yml")
	if err != nil {
		panic(err)
	}
	cfg := Config{}
	config.Decode(&cfg)
	return cfg
}

func LoadDatabase(dbPath string) *sql.DB {
	if _, err := os.Stat(dbPath); os.IsNotExist(err) {
		os.MkdirAll(path.Dir(dbPath), 0755)
		os.Create(dbPath)
	} else if err != nil {
		panic(err)
	}

	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		panic(err)
	}

	// TODO: update database schema
	req := `
    CREATE TABLE IF NOT EXISTS Users (
        Id INTEGER NOT NULL PRIMARY KEY,
        OAuthUserId TEXT UNIQUE NOT NULL,
        Username TEXT UNIQUE NOT NULL
    );
    CREATE TABLE IF NOT EXISTS TelegramUsers (
        Id INTEGER NOT NULL PRIMARY KEY,
        Username TEXT UNIQUE NOT NULL,
        ChatId INTEGER UNIQUE NOT NULL
    );
    CREATE TABLE IF NOT EXISTS Plans (
        Id INTEGER NOT NULL PRIMARY KEY,
        OwnerId INTEGER NOT NULL,
        TextId TEXT UNIQUE NOT NULL,
        Name TEXT NOT NULL,
        FOREIGN KEY (OwnerId) REFERENCES Users (Id)
    );
    CREATE TABLE IF NOT EXISTS PlanBlocks (
        Id INTEGER NOT NULL PRIMARY KEY,
        NextId INTEGER,
        PlanId INTEGER,
        Type TEXT NOT NULL,
        Day INTEGER,
        Content TEXT,
        IntervalStart INTEGER,
        IntervalEnd INTEGER,
        Name TEXT,
        Description TEXT,
        Key TEXT,
        Value TEXT,
        FOREIGN KEY (PlanId) REFERENCES Plans (Id)
    );
    CREATE TABLE IF NOT EXISTS Deployments (
        Id INTEGER NOT NULL PRIMARY KEY,
        OwnerId INTEGER NOT NULL,
        PlanTextId INTEGER NOT NULL,
        TelegramUsername TEXT NOT NULL,
        CurrentBlockId INTEGER,
        CurrentDay INTEGER NOT NULL,
        FOREIGN KEY (OwnerId) REFERENCES Users (Id),
        FOREIGN KEY (PlanTextId) REFERENCES Plans (TextId),
        FOREIGN KEY (CurrentBlockId) REFERENCES PlanBlocks (Id)
    );
    `

	if _, err := db.Exec(req); err != nil {
		panic(err)
	}
	return db
}

func initOAuth2Client(config *Config) ory.OAuth2API {
	configuration := ory.NewConfiguration()
	configuration.Servers = []ory.ServerConfiguration{
		{
			URL: config.Ory.Url,
		},
	}
	oauth2 := ory.NewAPIClient(configuration).OAuth2API
	return oauth2
}

type User struct {
	Id          int64
	OAuthUserId string
	Username    string
}

func userMiddleware(responseWriter http.ResponseWriter, request *http.Request, oauth2 ory.OAuth2API, db *sql.DB, nextFunc func(http.ResponseWriter, *http.Request, *User)) {
	slog.Debug(fmt.Sprintf("HttpAPI started hanling request %s %s", request.Method, request.URL.Path))

	authorizationHeader := request.Header.Get("Authorization")
	if authorizationHeader == "" {
		responseWriter.WriteHeader(http.StatusUnauthorized)
		return
	}
	accessToken := strings.Split(authorizationHeader, "Bearer ")[1]

	oauth2Response, httpResp, err := oauth2.IntrospectOAuth2Token(context.Background()).Token(accessToken).Execute()
	if err != nil {
		slog.Debug("Error of Inrospecting", "httpResponse", httpResp)
		panic(err)
	}
	if !oauth2Response.HasSub() {
		slog.Debug("", "oauth2Response", oauth2Response)
		responseWriter.WriteHeader(http.StatusUnauthorized)
		return
	}
	userInfo := strings.SplitAfterN(*oauth2Response.Sub, " ", 2)
	user := User{OAuthUserId: userInfo[0], Username: userInfo[1]}

	_, err = db.Exec("INSERT OR IGNORE INTO Users (OAuthUserId, Username) VALUES (?, ?)", user.OAuthUserId, user.Username)
	if err != nil {
		panic(err)
	}
	err = db.QueryRow("SELECT Id FROM Users WHERE OAuthUserId=?", user.OAuthUserId).Scan(&user.Id)
	if err != nil {
		panic(err)
	}

	nextFunc(responseWriter, request, &user)
}

type PlanBlocksRow struct {
	Id            int64
	NextId        sql.NullInt64
	Type          string
	Day           sql.NullInt64
	Content       sql.NullString
	IntervalStart sql.NullInt64
	IntervalEnd   sql.NullInt64
	Name          sql.NullString
	Description   sql.NullString
	Key           sql.NullString
	Value         sql.NullString
}
type FeedInfoBlock struct {
	Type    string `json:"type"`
	Day     int64  `json:"day"`
	Content string `json:"content"`
}
type AssignTaskBlock struct {
	Type        string  `json:"type"`
	Interval    []int64 `json:"interval"`
	Name        string  `json:"name"`
	Description string  `json:"description"`
}
type MetaBlock struct {
	Type  string `json:"type"`
	Key   string `json:"key"`
	Value string `json:"value"`
}

func initHttpAPI(config *Config, db *sql.DB) {
	oauth2 := initOAuth2Client(config)

	HandleFunc := func(pattern string, handler func(responseWriter http.ResponseWriter, request *http.Request, user *User)) {
		http.HandleFunc(pattern, func(responseWriter http.ResponseWriter, request *http.Request) {
			userMiddleware(responseWriter, request, oauth2, db, handler)
		})
	}

	type Plan struct {
		TextId string `json:"textId"`
		Name   string `json:"name"`
	}

	HandleFunc("GET /plans", func(responseWriter http.ResponseWriter, request *http.Request, user *User) {
		rows, err := db.Query("SELECT TextId, Name FROM Plans WHERE OwnerId=?", user.Id)
		if err != nil {
			panic(err)
		}

		plans := []Plan{}
		for rows.Next() {
			plan := Plan{}
			err = rows.Scan(&plan.TextId, &plan.Name)
			if err != nil {
				panic(err)
			}
			plans = append(plans, plan)
		}

		responseWriter.Header().Add("Content-Type", "application/json")
		responseWriter.WriteHeader(http.StatusOK)
		err = json.NewEncoder(responseWriter).Encode(plans)
		if err != nil {
			panic(err)
		}
	})

	HandleFunc("POST /plans", func(responseWriter http.ResponseWriter, request *http.Request, user *User) {
		plan := Plan{}
		err := json.NewDecoder(request.Body).Decode(&plan)
		if err != nil {
			panic(err)
		}

		_, err = db.Exec("INSERT INTO Plans (OwnerId, TextId, Name) VALUES (?, ?, ?)", user.Id, plan.TextId, plan.Name)
		if err != nil {
			panic(err)
		}

		responseWriter.WriteHeader(http.StatusOK)
	})

	HandleFunc("DELETE /plans/{id}", func(responseWriter http.ResponseWriter, request *http.Request, user *User) {
		var planId int64
		textId := request.PathValue("id")

		err := db.QueryRow("SELECT Id FROM Plans WHERE TextId=?", textId).Scan(&planId)
		if err != nil {
			panic(err)
		}
		_, err = db.Exec("DELETE FROM PlanBlocks WHERE PlanId=?; DELETE FROM Plans WHERE TextId=?", planId, textId)
		if err != nil {
			panic(err)
		}

		responseWriter.WriteHeader(http.StatusOK)
	})

	HandleFunc("GET /plans/{id}", func(responseWriter http.ResponseWriter, request *http.Request, user *User) {
		var planId int64
		textId := request.PathValue("id")

		err := db.QueryRow("SELECT Id FROM Plans WHERE TextId=?", textId).Scan(&planId)
		if err != nil {
			panic(err)
		}

		blocks := []interface{}{}
		appendBlock := func(row *PlanBlocksRow) {
			switch row.Type {
			case "Feed info":
				blocks = append(blocks, FeedInfoBlock{Type: row.Type, Day: row.Day.Int64, Content: row.Content.String})
			case "Assign task":
				blocks = append(blocks, AssignTaskBlock{Type: row.Type, Interval: []int64{row.IntervalStart.Int64, row.IntervalEnd.Int64}, Name: row.Name.String, Description: row.Description.String})
			case "Meta":
				blocks = append(blocks, MetaBlock{Type: row.Type, Key: row.Key.String, Value: row.Value.String})
			}
		}

		row := PlanBlocksRow{}
		err = db.QueryRow("SELECT Id, NextId, Type, Day, Content, IntervalStart, IntervalEnd, Name, Description, Key, Value FROM PlanBlocks WHERE PlanId=?", planId).Scan(
			&row.Id, &row.NextId, &row.Type, &row.Day, &row.Content, &row.IntervalStart, &row.IntervalEnd, &row.Name, &row.Description, &row.Key, &row.Value,
		)
		if err == sql.ErrNoRows {
			responseWriter.Header().Add("Content-Type", "application/json")
			responseWriter.WriteHeader(http.StatusOK)
			json.NewEncoder(responseWriter).Encode(blocks)
			return
		} else if err != nil {
			panic(err)
		}
		appendBlock(&row)

		for row.NextId.Valid {
			err = db.QueryRow("SELECT Id, NextId, Type, Day, Content, IntervalStart, IntervalEnd, Name, Description, Key, Value FROM PlanBlocks WHERE Id=?", row.NextId.Int64).Scan(
				&row.Id, &row.NextId, &row.Type, &row.Day, &row.Content, &row.IntervalStart, &row.IntervalEnd, &row.Name, &row.Description, &row.Key, &row.Value,
			)
			if err != nil {
				panic(err)
			}
			appendBlock(&row)
		}

		responseWriter.Header().Add("Content-Type", "application/json")
		responseWriter.WriteHeader(http.StatusOK)
		json.NewEncoder(responseWriter).Encode(blocks)
	})

	isEqual := func(row PlanBlocksRow, block map[string]interface{}) bool {
		if row.Type != block["type"].(string) {
			return false
		}
		switch block["type"].(string) {
		case "Feed info":
			if row.Day.Int64 != int64(block["day"].(float64)) {
				return false
			}
			if row.Content.String != block["content"].(string) {
				return false
			}
		case "Assign task":
			if row.IntervalStart.Int64 != int64(block["interval"].([]float64)[0]) {
				return false
			}
			if row.IntervalEnd.Int64 != int64(block["interval"].([]float64)[1]) {
				return false
			}
			if row.Name.String != block["name"].(string) {
				return false
			}
			if row.Description.String != block["description"].(string) {
				return false
			}
		case "Meta":
			if row.Key.String != block["key"].(string) {
				return false
			}
			if row.Value.String != block["value"].(string) {
				return false
			}
		}
		return true
	}

	HandleFunc("POST /plans/{id}", func(responseWriter http.ResponseWriter, request *http.Request, user *User) {
		textId := request.PathValue("id")

		blocks := []map[string]interface{}{}
		json.NewDecoder(request.Body).Decode(&blocks)

		var planId int64
		err := db.QueryRow("SELECT Id FROM Plans WHERE TextId=?", textId).Scan(&planId)
		if err != nil {
			panic(err)
		}

		var lastId int64
		nextBlockExists := true
		prefixIsEqual := true
		var nextBlockId int64
		for i, block := range blocks {
			row := PlanBlocksRow{}
			if i == 0 {
				err = db.QueryRow("SELECT Id, NextId, Type, Day, Content, IntervalStart, IntervalEnd, Name, Description, Key, Value FROM PlanBlocks WHERE PlanId=?", planId).Scan(
					&row.Id, &row.NextId, &row.Type, &row.Day, &row.Content, &row.IntervalStart, &row.IntervalEnd, &row.Name, &row.Description, &row.Key, &row.Value,
				)
				if err == sql.ErrNoRows {
					nextBlockExists = false
					prefixIsEqual = false
				} else if err != nil {
					panic(err)
				} else if row.NextId.Valid {
					nextBlockId = row.NextId.Int64
				} else {
					nextBlockExists = false
				}
			} else if nextBlockExists {
				err = db.QueryRow("SELECT Id, NextId, Type, Day, Content, IntervalStart, IntervalEnd, Name, Description, Key, Value FROM PlanBlocks WHERE Id=?", nextBlockId).Scan(
					&row.Id, &row.NextId, &row.Type, &row.Day, &row.Content, &row.IntervalStart, &row.IntervalEnd, &row.Name, &row.Description, &row.Key, &row.Value,
				)
				if err != nil {
					panic(err)
				}
				if row.NextId.Valid {
					nextBlockId = row.NextId.Int64
				} else {
					nextBlockExists = false
				}
			} else {
				prefixIsEqual = false
			}
			if prefixIsEqual {
				if !isEqual(row, block) {
					prefixIsEqual = false
				}
			}

			if prefixIsEqual {
				lastId = row.Id
				continue
			}

			if i == 0 {
				_, err = db.Exec("UPDATE PlanBlocks SET PlanId=NULL WHERE PlanId=?", planId)
				if err != nil {
					panic(err)
				}
			}

			sqlData := map[string]interface{}{"Type": block["type"].(string)}
			if i == 0 {
				sqlData["PlanId"] = planId
			}
			switch block["type"].(string) {
			case "Feed info":
				sqlData["Day"] = block["day"].(float64)
				sqlData["Content"] = block["content"].(string)
			case "Assign task":
				slog.Debug("abra", "iterface", block["interval"])
				sqlData["IntervalStart"] = block["interval"].([]interface{})[0].(float64)
				sqlData["IntervalEnd"] = block["interval"].([]interface{})[1].(float64)
				sqlData["Name"] = block["name"].(string)
				sqlData["Description"] = block["description"].(string)
			case "Meta":
				sqlData["Key"] = block["key"].(string)
				sqlData["Value"] = block["value"].(string)
			}

			columnNames := ""
			valuePlaceholders := ""
			values := []interface{}{}
			first := true
			for key, value := range sqlData {
				if first {
					first = false
				} else {
					columnNames += ", "
					valuePlaceholders += ", "
				}
				columnNames += key
				valuePlaceholders += "?"
				values = append(values, value)
			}

			var currentId int64
			slog.Debug(fmt.Sprintf("INSERT INTO PlanBlocks (%s) VALUES (%s)", columnNames, valuePlaceholders), "values", values)
			err = db.QueryRow(fmt.Sprintf("INSERT INTO PlanBlocks (%s) VALUES (%s) RETURNING Id", columnNames, valuePlaceholders), values...).Scan(&currentId)
			if err != nil {
				panic(err)
			}
			if i > 0 {
				_, err = db.Exec("UPDATE PlanBlocks SET NextId=? WHERE Id=?", currentId, lastId)
				if err != nil {
					panic(err)
				}
			}
			lastId = currentId
		}
	})

	HandleFunc("GET /username", func(responseWriter http.ResponseWriter, request *http.Request, user *User) {
		responseWriter.Header().Add("Content-Type", "text/plain")
		responseWriter.WriteHeader(http.StatusOK)
		responseWriter.Write([]byte(user.Username))
	})

	type Deployment struct {
		PlanTextId       string `json:"planTextId"`
		TelegramUsername string `json:"telegramUsername"`
	}

	HandleFunc("GET /deployments", func(responseWriter http.ResponseWriter, request *http.Request, user *User) {
		rows, err := db.Query("SELECT PlanTextId, TelegramUsername FROM Deployments WHERE OwnerId=?", user.Id)
		if err != nil {
			panic(err)
		}

		deployments := []Deployment{}
		for rows.Next() {
			deployment := Deployment{}
			err = rows.Scan(&deployment.PlanTextId, &deployment.TelegramUsername)
			if err != nil {
				panic(err)
			}
			deployments = append(deployments, deployment)
		}

		responseWriter.Header().Add("Content-Type", "application/json")
		responseWriter.WriteHeader(http.StatusOK)
		json.NewEncoder(responseWriter).Encode(deployments)
	})

	HandleFunc("POST /deployments", func(responseWriter http.ResponseWriter, request *http.Request, user *User) {
		newDeployment := Deployment{}
		err := json.NewDecoder(request.Body).Decode(&newDeployment)
		if err != nil {
			panic(err)
		}

		var planId int64
		err = db.QueryRow("SELECT Id FROM Plans WHERE TextId=?", newDeployment.PlanTextId).Scan(&planId)
		if err != nil {
			panic(err)
		}

		var blockId sql.NullInt64
		err = db.QueryRow("SELECT Id FROM PlanBlocks WHERE PlanId=?", planId).Scan(&blockId)
		if err == sql.ErrNoRows {
			blockId.Valid = false
		} else if err != nil {
			panic(err)
		}

		_, err = db.Exec("INSERT INTO Deployments (PlanTextId, TelegramUsername, OwnerId, CurrentBlockId, CurrentDay) VALUES (?, ?, ?, ?, 1)", newDeployment.PlanTextId, newDeployment.TelegramUsername, user.Id, blockId)
		if err != nil {
			panic(err)
		}

		responseWriter.WriteHeader(http.StatusOK)
	})

	addr := fmt.Sprintf("%s:%s", config.HttpAPI.Host, config.HttpAPI.Port)
	slog.Info(fmt.Sprintf("Starting HttpAPI at %s...", addr))
	err := http.ListenAndServe(addr, nil)
	panic(err)
}

func main() {
	logger := slog.New(mylog.NewHandler(&slog.HandlerOptions{AddSource: true, Level: slog.LevelDebug.Level()}))
	slog.SetDefault(logger)

	slog.Info("Loading config...")
	cfg := LoadConfig()
	slog.Debug("Loaded config", "content", cfg)
	slog.Info("Loading database...")
	db := LoadDatabase(cfg.Database.Path)

	ctx, cancel := signal.NotifyContext(context.Background(), os.Interrupt)
	ctx = context.WithValue(ctx, contextKey("config"), cfg)
	defer cancel()

	loc, err := time.LoadLocation("Europe/Moscow")
	if err != nil {
		panic(err)
	}
	s, err := gocron.NewScheduler(gocron.WithLocation(loc))
	if err != nil {
		panic(err)
	}

	opts := []bot.Option{
		bot.WithDefaultHandler(func(ctx context.Context, b *bot.Bot, update *models.Update) {
			defaultHandler(ctx, b, update, &cfg, db, s)
		}),
	}

	b, err := bot.New(cfg.Bot.Token, opts...)
	if err != nil {
		panic(err)
	}

	user, err := b.GetMe(ctx)
	if err != nil {
		panic(err)
	}
	BotUser = *user

	startJobs(b, s, db)

	go initHttpAPI(&cfg, db)

	slog.Info("Starting listener for updates...")
	b.Start(ctx)
}

type Deployment struct {
	Id int64
	Username string
	CurrentBlockId sql.NullInt64
    CurrentDay int64
    PlanTextId string
}

func sendMessages(b *bot.Bot, db *sql.DB) {
	slog.Info("Sending messages...")
	rows, err := db.Query("SELECT Id, TelegramUsername, CurrentBlockId, CurrentDay, PlanTextId FROM Deployments")
	if err != nil {
		panic(err)
	}

    deployments := []Deployment{}
    for rows.Next() {
        deployment := Deployment{}
		err = rows.Scan(&deployment.Id, &deployment.Username, &deployment.CurrentBlockId, &deployment.CurrentDay, &deployment.PlanTextId)
        deployments = append(deployments, deployment)
    }
    rows.Close()

    for _, deployment := range deployments {
        id := deployment.Id
        username := deployment.Username
        currentBlockId := deployment.CurrentBlockId
        day := deployment.CurrentDay
        var chatId int64

        slog.Debug("Deployment", "val", deployment)
        err = db.QueryRow("SELECT ChatId FROM TelegramUsers WHERE Username=?", username).Scan(&chatId)
        if err == sql.ErrNoRows {
            slog.Debug("No rows")
            continue
        } else if err != nil {
            panic(err)
        }
        slog.Debug("Rows")

        // _, err := b.SendMessage(context.Background(), &bot.SendMessageParams{
        //     ChatID:    chatId,
        //     Text:      fmt.Sprintf("*[For demostrational purposes]* *PlanId* _%s_ *Day* _%d_", deployment.PlanTextId, day),
        //     ParseMode: "markdown",
        // })
        // if err != nil {
        //     panic(err)
        // }

        slog.Debug("After debug")
		for currentBlockId.Valid {
            slog.Debug("Valid")
			row := PlanBlocksRow{}
			err = db.QueryRow("SELECT Id, NextId, Type, Day, Content, IntervalStart, IntervalEnd, Name, Description, Key, Value FROM PlanBlocks WHERE Id=?", currentBlockId).Scan(
				&row.Id, &row.NextId, &row.Type, &row.Day, &row.Content, &row.IntervalStart, &row.IntervalEnd, &row.Name, &row.Description, &row.Key, &row.Value,
			)
            nextBlockId := row.NextId
			if err != nil {
				panic(err)
			}
			if row.Type == "Feed info" {
				if day < row.Day.Int64 {
                    nextBlockId = currentBlockId
				}
            } else if row.Type == "Assign task" {
				if day < row.IntervalStart.Int64 {
                    nextBlockId = currentBlockId
				}
			}
			_, err = db.Exec("UPDATE Deployments SET CurrentBlockId=?, CurrentDay=? WHERE Id=?", nextBlockId, day + 1, id)
			if err != nil {
				panic(err)
			}
            if nextBlockId == currentBlockId {
                break
            }
			currentBlockId = row.NextId

			switch row.Type {
			case "Feed info":
				_, err := b.SendMessage(context.Background(), &bot.SendMessageParams{
					ChatID:    chatId,
					Text:      row.Content.String,
					ParseMode: "markdown",
				})
				if err != nil {
					panic(err)
				}
			case "Assign task":
				_, err := b.SendMessage(context.Background(), &bot.SendMessageParams{
					ChatID:    chatId,
                    Text:      fmt.Sprintf("*TASK: %s*\n*DEADLINE: %s*\n\n*DESCRIPTION:*\n%s", row.Name.String, time.Now().Local().Add(time.Duration(1000*1000*1000*60*60*24*(row.IntervalEnd.Int64-row.IntervalStart.Int64))).Format("Mon, 02 Jan 2006"), row.Description.String),
					ParseMode: "markdown",
				})
				if err != nil {
					panic(err)
				}
			}

            if !row.NextId.Valid {
                _, err = db.Exec("DELETE FROM Deployments WHERE Id=?", id)
                if err != nil {
                    panic(err)
                }
            }
		}
	}
}

func defaultHandler(ctx context.Context, b *bot.Bot, update *models.Update, config *Config, db *sql.DB, s gocron.Scheduler) {
	if update.Message != nil {
		messageHandler(ctx, b, update.Message, config, db, s)
	}
}

func cacheChadId(msg *models.Message, db *sql.DB) {
	_, err := db.Exec("INSERT OR REPLACE INTO TelegramUsers (Username, ChatId) VALUES (?, ?)", msg.From.Username, msg.Chat.ID)
	if err != nil {
		panic(err)
	}
}

func messageHandler(ctx context.Context, b *bot.Bot, msg *models.Message, config *Config, db *sql.DB, s gocron.Scheduler) {
	slog.Debug(fmt.Sprintf(`Handling Message update from @%s with text "%s"`, msg.From.Username, msg.Text))
	switch msg.Chat.Type {
	case "private":
		routeMessage(ctx, b, msg, config, db, s)
	default:
		log.Fatalf("Unexprected chat type: %v", msg.Chat.Type)
	}
}

func routeMessage(ctx context.Context, b *bot.Bot, msg *models.Message, config *Config, db *sql.DB, s gocron.Scheduler) {
	slog.Debug(fmt.Sprintf("Routing message from user id %d ...", msg.From.ID))

	if msg.Text == "/help" {
		slog.Debug("Routing to Help")
        cacheChadId(msg, db)
		help(ctx, b, msg)
	}

	isAdmin := Contains(config.Bot.AdminIds, msg.From.ID)
	if !isAdmin {
		return
	}
}

func help(ctx context.Context, b *bot.Bot, msg *models.Message) {
	text := `Hello, I am your mentor bot! I will send you new info and assign task according to metorship plan ❤️`
	_, err := b.SendMessage(ctx, &bot.SendMessageParams{
		ChatID:    msg.Chat.ID,
		Text:      text,
		ParseMode: "markdown",
	})
	if err != nil {
		panic(err)
	}
}

func startJobs(b *bot.Bot, s gocron.Scheduler, db *sql.DB) {
	slog.Debug("Registering jobs...")
	_, err := s.NewJob(
		gocron.DurationJob(
            time.Second*2,
		),
		gocron.NewTask(
			sendMessages,
			b,
			db,
		),
	)
	if err != nil {
		panic(err)
	}
	s.Start()
}

func Contains[T comparable](s []T, e T) bool {
	for _, a := range s {
		if a == e {
			return true
		}
	}
	return false
}
