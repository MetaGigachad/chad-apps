package http_api

import (
	"context"
	"database/sql"
	"fmt"
	"log/slog"
	"net"
	"net/http"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	"github.com/MetaGigachad/chad-apps/onboarding_service/internals/config"
	"github.com/MetaGigachad/chad-apps/onboarding_service/internals/db"
	"github.com/MetaGigachad/chad-apps/onboarding_service/internals/msg"
	"github.com/jmoiron/sqlx"
	jsoniter "github.com/json-iterator/go"
	ory "github.com/ory/client-go"

	_ "github.com/mattn/go-sqlite3"
)

func ListenAndServe(config *config.Config, db *sqlx.DB, stopChan <-chan struct{}, wg *sync.WaitGroup) {
    defer wg.Done()

    pattern := func(method string, path string) string {
        return fmt.Sprintf("%s %s%s", method, config.HttpAPI.PathPrefix, path)
    }

	serveMux := http.NewServeMux()
	serveMux.Handle(pattern("GET", "/config"), http.HandlerFunc(getConfigHandler))
	serveMux.Handle(pattern("GET", "/username"), authMiddleware(http.HandlerFunc(getUsernameHandler)))
	serveMux.Handle(pattern("GET", "/plans"), authMiddleware(http.HandlerFunc(getPlansHandler)))
	serveMux.Handle(pattern("POST", "/plans"), authMiddleware(http.HandlerFunc(newPlanHandler)))
	serveMux.Handle(pattern("GET", "/plans/{id}"), authMiddleware(http.HandlerFunc(getPlanHandler)))
	serveMux.Handle(pattern("POST", "/plans/{id}"), authMiddleware(http.HandlerFunc(migratePlanHandler)))
	serveMux.Handle(pattern("DELETE", "/plans/{id}"), authMiddleware(http.HandlerFunc(deletePlanHandler)))
	serveMux.Handle(pattern("GET", "/deployments"), authMiddleware(http.HandlerFunc(getDeploymentsHandler)))
	serveMux.Handle(pattern("POST", "/deployments"), authMiddleware(http.HandlerFunc(newDeploymentHandler)))
	handler := loggingMiddleware(serveMux)

	ctx := context.Background()
	ctx = context.WithValue(ctx, "oauth2", MakeOauth2Client(config))
	ctx = context.WithValue(ctx, "db", db)
	ctx = context.WithValue(ctx, "json", msg.MakeJsonAPI())
	ctx = context.WithValue(ctx, "config", config)

	server := &http.Server{
		Addr:    fmt.Sprintf("%s:%s", config.HttpAPI.Host, config.HttpAPI.Port),
		Handler: handler,
		BaseContext: func(net.Listener) context.Context {
			return ctx
		},
	}

	go func() {
        slog.Info(fmt.Sprintf("Server listening on %s...\n", server.Addr))
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
            panic(err)
		}
	}()

    <-stopChan
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := server.Shutdown(ctx); err != nil {
		panic(fmt.Sprintf("Server Shutdown:", err))
	}
	slog.Info("Server shutdown complete")
}

func MakeOauth2Client(config *config.Config) ory.OAuth2API {
	configuration := ory.NewConfiguration()
	configuration.Servers = []ory.ServerConfiguration{
		{
			URL: config.Ory.Url,
		},
	}
	oauth2 := ory.NewAPIClient(configuration).OAuth2API
	return oauth2
}

func loggingMiddleware(next http.Handler) http.Handler {
	requestId := int64(0)
    makeFullUrl := func(r *http.Request) string {
        scheme := "http"
        if r.TLS != nil {
            scheme = "https"
        }
        return fmt.Sprintf("%s://%s%s", scheme, r.Host, r.RequestURI)
    }
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		atomic.AddInt64(&requestId, 1)
		logger := slog.Default().With("requestId", requestId)
		r = r.WithContext(context.WithValue(r.Context(), "logger", logger))

		description := fmt.Sprintf("HTTP %s %s from %s", r.Method, makeFullUrl(r), getClientIP(r))
		logger.Debug(description, "headers", r.Header)

		next.ServeHTTP(w, r)

		logger.Debug("Ended")
	})
}

func authMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		DB := r.Context().Value("db").(*sqlx.DB)
		logger := r.Context().Value("logger").(*slog.Logger)
		oauth2 := r.Context().Value("oauth2").(ory.OAuth2API)

		authorizationHeader := r.Header.Get("Authorization")
		if authorizationHeader == "" {
			code := http.StatusUnauthorized
			w.WriteHeader(code)
			logger.Debug(fmt.Sprintf("%d %s", code, http.StatusText(code)), "reason", "Authorization header is absent")
			return
		}
		accessToken := strings.Split(authorizationHeader, "Bearer ")[1]

		oauth2Response, httpResp, err := oauth2.IntrospectOAuth2Token(context.Background()).Token(accessToken).Execute()
		if err != nil {
			slog.Debug("Error of Inrospecting", "httpResponse", httpResp)
			panic(err)
		}
        logger.Debug("oauth2Response info", "res", oauth2Response)
		if !oauth2Response.HasSub() {
			code := http.StatusUnauthorized
			w.WriteHeader(http.StatusUnauthorized)
			logger.Debug(fmt.Sprintf("%d %s", code, http.StatusText(code)), "reason", "OAuth2 server response has no subject field")
			return
		}
		userInfo := strings.SplitAfterN(*oauth2Response.Sub, " ", 2)
		user := &db.User{OAuthUserId: userInfo[0], Username: userInfo[1]}

		DB.MustExec("INSERT OR IGNORE INTO Users (OAuthUserId, Username) VALUES (?, ?)", user.OAuthUserId, user.Username)
		err = DB.Get(user, "SELECT Id FROM Users WHERE OAuthUserId=?", user.OAuthUserId)
		if err != nil {
			panic(err)
		}

		r = r.WithContext(context.WithValue(r.Context(), "user", user))
		next.ServeHTTP(w, r)
	})
}

func getClientIP(r *http.Request) string {
	forwarded := r.Header.Get("X-Forwarded-For")
	if forwarded != "" {
		ips := strings.Split(forwarded, ",")
		return strings.TrimSpace(ips[0])
	}

	realIP := r.Header.Get("X-Real-IP")
	if realIP != "" {
		return realIP
	}

	ip, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return ""
	}

	return ip
}

func getConfigHandler(w http.ResponseWriter, r *http.Request) {
    config := r.Context().Value("config").(*config.Config)
	json := r.Context().Value("json").(jsoniter.API)
    
    frontendConfig := msg.FrontendConfig{
        OAuth2: msg.FrontendConfigOAuth2 {
            AuthUrl: config.FrontendConfig.OAuth2.AuthUrl,
            TokenUrl: config.FrontendConfig.OAuth2.TokenUrl,
            ClientId: config.FrontendConfig.OAuth2.ClientId,
            RedirectUri: config.FrontendConfig.OAuth2.RedirectUri,
        },
    }

	w.Header().Add("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
    err := json.NewEncoder(w).Encode(frontendConfig)
	if err != nil {
		panic(err)
	}
}

func getPlansHandler(w http.ResponseWriter, r *http.Request) {
	DB := r.Context().Value("db").(*sqlx.DB)
	json := r.Context().Value("json").(jsoniter.API)
	user := r.Context().Value("user").(*db.User)

	plans := []msg.Plan{}
	err := DB.Select(&plans, "SELECT TextId, Name FROM Plans WHERE OwnerId=?", user.Id)
	if err != nil {
		panic(err)
	}

	w.Header().Add("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	err = json.NewEncoder(w).Encode(plans)
	if err != nil {
		panic(err)
	}
}

func newPlanHandler(w http.ResponseWriter, r *http.Request) {
	DB := r.Context().Value("db").(*sqlx.DB)
	json := r.Context().Value("json").(jsoniter.API)
	user := r.Context().Value("user").(*db.User)

	plan := msg.Plan{}
	err := json.NewDecoder(r.Body).Decode(&plan)
	if err != nil {
		panic(err)
	}

	DB.MustExec("INSERT INTO Plans (OwnerId, TextId, Name) VALUES (?, ?, ?)", user.Id, plan.TextId, plan.Name)

	w.WriteHeader(http.StatusOK)
}

func deletePlanHandler(w http.ResponseWriter, r *http.Request) {
	DB := r.Context().Value("db").(*sqlx.DB)
	user := r.Context().Value("user").(*db.User)
	textId := r.PathValue("id")

	plan := db.Plan{}
	err := DB.Get(&plan, "SELECT Id FROM Plans WHERE OwnerId=? AND TextId=?", user.Id, textId)
	if err != nil {
		panic(err)
	}
	DB.MustExec("DELETE FROM PlanBlocks WHERE PlanId=?; DELETE FROM Plans WHERE TextId=?", plan.Id, textId)

	w.WriteHeader(http.StatusOK)
}

func dbToMsgPlanBlock(dbBlock db.PlanBlock) any {
	switch dbBlock.Type {
	case "Feed info":
		return msg.FeedInfoBlock{Type: dbBlock.Type, Day: dbBlock.Day.Int64, Content: dbBlock.Content.String}
	case "Assign task":
		return msg.AssignTaskBlock{
			Type:        dbBlock.Type,
			Interval:    []int64{dbBlock.IntervalStart.Int64, dbBlock.IntervalEnd.Int64},
			Name:        dbBlock.Name.String,
			Description: dbBlock.Description.String,
		}
	case "Meta":
		return msg.MetaBlock{Type: dbBlock.Type, Key: dbBlock.Key.String, Value: dbBlock.Value.String}
	}
	panic(fmt.Sprintf("Unsupported row type '%s'", dbBlock.Type))
}

func getPlanHandler(w http.ResponseWriter, r *http.Request) {
	DB := r.Context().Value("db").(*sqlx.DB)
	json := r.Context().Value("json").(jsoniter.API)
	user := r.Context().Value("user").(*db.User)
	textId := r.PathValue("id")

	plan := db.Plan{}
	err := DB.Get(&plan, "SELECT Id FROM Plans WHERE OwnerId=? AND TextId=?", user.Id, textId)
	if err != nil {
		panic(err)
	}

	blocks := []any{}
	row := db.PlanBlock{}

	err = DB.Get(&row, "SELECT * FROM PlanBlocks WHERE PlanId=?", plan.Id)
	if err == sql.ErrNoRows {
		w.Header().Add("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(blocks)
		return
	} else if err != nil {
		panic(err)
	}
	blocks = append(blocks, dbToMsgPlanBlock(row))

	for row.NextId.Valid {
		err = DB.Get(&row, "SELECT * FROM PlanBlocks WHERE Id=?", row.NextId.Int64)
		if err != nil {
			panic(err)
		}
		blocks = append(blocks, dbToMsgPlanBlock(row))
	}

	w.Header().Add("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(blocks)
}

var isEqual = func(row db.PlanBlock, block map[string]interface{}) bool {
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

func migratePlanHandler(w http.ResponseWriter, r *http.Request) {
	DB := r.Context().Value("db").(*sqlx.DB)
	json := r.Context().Value("json").(jsoniter.API)
	user := r.Context().Value("user").(*db.User)
	textId := r.PathValue("id")

	blocks := []map[string]interface{}{}
	json.NewDecoder(r.Body).Decode(&blocks)

	plan := db.Plan{}
	err := DB.Get(&plan, "SELECT Id FROM Plans WHERE OwnerId=? AND TextId=?", user.Id, textId)
	if err != nil {
		panic(err)
	}

	var lastId int64
	nextBlockExists := true
	prefixIsEqual := true
	var nextBlockId int64
	for i, block := range blocks {
		row := db.PlanBlock{}
		if i == 0 {
			err = DB.QueryRow("SELECT Id, NextId, Type, Day, Content, IntervalStart, IntervalEnd, Name, Description, Key, Value FROM PlanBlocks WHERE PlanId=?", plan.Id).Scan(
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
			err = DB.QueryRow("SELECT Id, NextId, Type, Day, Content, IntervalStart, IntervalEnd, Name, Description, Key, Value FROM PlanBlocks WHERE Id=?", nextBlockId).Scan(
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
			_, err = DB.Exec("UPDATE PlanBlocks SET PlanId=NULL WHERE PlanId=?", plan.Id)
			if err != nil {
				panic(err)
			}
		}

		sqlData := map[string]interface{}{"Type": block["type"].(string)}
		if i == 0 {
			sqlData["PlanId"] = plan.Id
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
		err = DB.QueryRow(fmt.Sprintf("INSERT INTO PlanBlocks (%s) VALUES (%s) RETURNING Id", columnNames, valuePlaceholders), values...).Scan(&currentId)
		if err != nil {
			panic(err)
		}
		if i > 0 {
			_, err = DB.Exec("UPDATE PlanBlocks SET NextId=? WHERE Id=?", currentId, lastId)
			if err != nil {
				panic(err)
			}
		}
		lastId = currentId
	}
}

func getUsernameHandler(w http.ResponseWriter, r *http.Request) {
	user := r.Context().Value("user").(*db.User)

	w.Header().Add("Content-Type", "text/plain")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(user.Username))
}

func getDeploymentsHandler(w http.ResponseWriter, r *http.Request) {
	DB := r.Context().Value("db").(*sqlx.DB)
	json := r.Context().Value("json").(jsoniter.API)
	user := r.Context().Value("user").(*db.User)

	deployments := []msg.Deployment{}
	err := DB.Select(&deployments, "SELECT PlanTextId, TelegramUsername FROM Deployments WHERE OwnerId=?", user.Id)
	if err != nil {
		panic(err)
	}

	w.Header().Add("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(deployments)
}

func newDeploymentHandler(w http.ResponseWriter, r *http.Request) {
	DB := r.Context().Value("db").(*sqlx.DB)
	json := r.Context().Value("json").(jsoniter.API)
	user := r.Context().Value("user").(*db.User)

	newDeployment := msg.Deployment{}
	err := json.NewDecoder(r.Body).Decode(&newDeployment)
	if err != nil {
		panic(err)
	}

	plan := db.Plan{}
	err = DB.Get(&plan, "SELECT Id FROM Plans WHERE OwnerId=? AND TextId=?", user.Id, newDeployment.PlanTextId)
	if err != nil {
		panic(err)
	}

	dbDeployment := db.Deployment{
		PlanTextId:       newDeployment.PlanTextId,
		TelegramUsername: newDeployment.TelegramUsername,
		OwnerId:          user.Id,
	}

	block := db.PlanBlock{}
	err = DB.Get(&block, "SELECT Id FROM PlanBlocks WHERE PlanId=?", plan.Id)
	if err == sql.ErrNoRows {
		dbDeployment.CurrentBlockId.Valid = false
	} else if err != nil {
		panic(err)
	} else {
		dbDeployment.CurrentBlockId.Valid = true
		dbDeployment.CurrentBlockId.Int64 = block.Id
	}

	_, err = DB.NamedExec(
		"INSERT INTO Deployments (PlanTextId, TelegramUsername, OwnerId, CurrentBlockId, CurrentDay) VALUES (:PlanTextId, :TelegramUsername, :OwnerId, :CurrentBlockId, 1)",
		dbDeployment,
	)
	if err != nil {
		panic(err)
	}

	w.WriteHeader(http.StatusOK)
}
