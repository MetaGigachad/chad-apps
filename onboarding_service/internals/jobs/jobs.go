package jobs

import (
	"context"
	"database/sql"
	"fmt"
	"log/slog"
	"sync"
	"time"

	"github.com/MetaGigachad/chad-apps/onboarding_service/internals/db"
	"github.com/go-co-op/gocron/v2"
	"github.com/go-telegram/bot"
	"github.com/go-telegram/bot/models"
	"github.com/jmoiron/sqlx"

	_ "github.com/mattn/go-sqlite3"
)

func StartScheduler(bot *bot.Bot, db *sqlx.DB, stopChan <-chan struct{}, wg *sync.WaitGroup) {
    defer wg.Done()

	loc, err := time.LoadLocation("Europe/Moscow")
	if err != nil {
		panic(err)
	}
	s, err := gocron.NewScheduler(gocron.WithLocation(loc))
	if err != nil {
		panic(err)
	}
	addJobs(bot, s, db)
	slog.Info("Starting job scheduler...")
	s.Start()

    <-stopChan
    err = s.Shutdown()
    if err != nil {
        panic(err)
    }
}

func addJobs(b *bot.Bot, s gocron.Scheduler, db *sqlx.DB) {
	slog.Debug("Registering jobs...")
	_, err := s.NewJob(
		gocron.DurationJob(
			time.Second*2,
		),
		gocron.NewTask(
			sendMessagesJob,
			b,
			db,
		),
	)
	if err != nil {
		panic(err)
	}
}

func sendMessagesJob(b *bot.Bot, DB *sqlx.DB) {
	rows, err := DB.Query("SELECT Id, TelegramUsername, CurrentBlockId, CurrentDay, PlanTextId FROM Deployments")
	if err != nil {
		panic(err)
	}

	deployments := []db.Deployment{}
	for rows.Next() {
		deployment := db.Deployment{}
		err = rows.Scan(&deployment.Id, &deployment.TelegramUsername, &deployment.CurrentBlockId, &deployment.CurrentDay, &deployment.PlanTextId)
		deployments = append(deployments, deployment)
	}
	rows.Close()

	for _, deployment := range deployments {
		id := deployment.Id
		username := deployment.TelegramUsername
		currentBlockId := deployment.CurrentBlockId
		day := deployment.CurrentDay
		var chatId int64

		slog.Debug("Deployment", "val", deployment)
		err = DB.QueryRow("SELECT ChatId FROM TelegramUsers WHERE Username=?", username).Scan(&chatId)
		if err == sql.ErrNoRows {
			slog.Debug("No rows")
			continue
		} else if err != nil {
			panic(err)
		}
		slog.Debug("Rows")

        debugMsgWasSent := false
        sendDebugMessage := func() {
            if debugMsgWasSent {
                return
            }
            debugMsgWasSent = true
            _, err := b.SendMessage(context.Background(), &bot.SendMessageParams{
                ChatID:    chatId,
                Text:      fmt.Sprintf("🪲 *[DEBUG]*\n*PLAN_ID:* *%s*\n*DAY:* *%d*", deployment.PlanTextId, day),
                ParseMode: "markdown",
            })
            if err != nil {
                panic(err)
            }
        }

		slog.Debug("After debug")
		for currentBlockId.Valid {
			slog.Debug("Valid")
			row := db.PlanBlock{}
			err = DB.QueryRow("SELECT Id, NextId, Type, Day, Content, IntervalStart, IntervalEnd, Name, Description, Key, Value FROM PlanBlocks WHERE Id=?", currentBlockId).Scan(
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
			_, err = DB.Exec("UPDATE Deployments SET CurrentBlockId=?, CurrentDay=? WHERE Id=?", nextBlockId, day+1, id)
			if err != nil {
				panic(err)
			}
			if nextBlockId == currentBlockId {
				break
			}
			currentBlockId = row.NextId

			switch row.Type {
			case "Feed info":
                sendDebugMessage()
				_, err := b.SendMessage(context.Background(), &bot.SendMessageParams{
					ChatID:    chatId,
					Text:      fmt.Sprintf("ℹ️ *NEW INFO*\n%s", row.Content.String),
					ParseMode: "markdown",
				})
				if err != nil {
					panic(err)
				}
			case "Assign task":
                sendDebugMessage()
				_, err := b.SendMessage(context.Background(), &bot.SendMessageParams{
					ChatID: chatId,
					Text: fmt.Sprintf("☑️ *NEW TASK*\n*NAME: %s*\n*DEADLINE: %s*\n*DESCRIPTION:*\n%s",
						row.Name.String,
                        time.Now().Local().Add(time.Duration(time.Hour.Nanoseconds()*24*(row.IntervalEnd.Int64-row.IntervalStart.Int64))).Format("Mon, 02 Jan 2006"),
						row.Description.String,
					),
					ParseMode: "markdown",
					ReplyMarkup: &models.InlineKeyboardMarkup{
						InlineKeyboard: [][]models.InlineKeyboardButton{{models.InlineKeyboardButton{
							Text:         "Complete ✅",
							CallbackData: "complete_task",
						}}},
					},
				})
				if err != nil {
					panic(err)
				}
			}

			if !row.NextId.Valid {
				_, err = DB.Exec("DELETE FROM Deployments WHERE Id=?", id)
				if err != nil {
					panic(err)
				}
			}
		}
	}
}
