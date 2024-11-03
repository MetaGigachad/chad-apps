package bot

import (
	"context"
	"fmt"
	"sync"
	"time"
	"unicode/utf16"
	"unicode/utf8"

	"log/slog"

	"github.com/MetaGigachad/chad-apps/onboarding_service/internals/config"
	"github.com/go-telegram/bot"
	"github.com/go-telegram/bot/models"
	"github.com/jmoiron/sqlx"

	_ "github.com/mattn/go-sqlite3"
)

var BotUser models.User

type Bot struct {
	Bot    *bot.Bot
	Ctx    *context.Context
	Cancel *context.CancelFunc
}

func MakeBot(config *config.Config, db *sqlx.DB) *Bot {
	ctx, cancel := context.WithCancel(context.Background())
	ctx = context.WithValue(ctx, "config", config)

	opts := []bot.Option{
		bot.WithDefaultHandler(func(ctx context.Context, b *bot.Bot, update *models.Update) {
			defaultHandler(ctx, b, update, db)
		}),
	}

	b, err := bot.New(config.Bot.Token, opts...)
	if err != nil {
		panic(err)
	}

	user, err := b.GetMe(ctx)
	if err != nil {
		panic(err)
	}
	BotUser = *user

	return &Bot{Bot: b, Ctx: &ctx, Cancel: &cancel}
}

func (b *Bot) Serve(stopChan <-chan struct{}, wg *sync.WaitGroup) {
	defer wg.Done()

	go func() {
		slog.Info("Starting telegram bot...", "BotUser", BotUser)
		b.Bot.Start(*b.Ctx)
	}()

	<-stopChan
	(*b.Cancel)()
}

func defaultHandler(ctx context.Context, b *bot.Bot, update *models.Update, db *sqlx.DB) {
	if update.Message != nil {
		messageHandler(ctx, b, update.Message, db)
	}
	if update.CallbackQuery != nil {
		callbackQueryHandler(ctx, b, update.CallbackQuery, db)
	}
}

func callbackQueryHandler(ctx context.Context, b *bot.Bot, query *models.CallbackQuery, db *sqlx.DB) {
	if query.Data == "complete_task" {
		getLen := func(str string) int { return len(utf16.Encode([]rune(str))) }
		msg := query.Message.Message
		msgText := msg.Text
		firstRune, _ := utf8.DecodeRuneInString(msgText)
        msgText = "✅" + msgText[utf8.RuneLen(firstRune):]
		completedAt := fmt.Sprintf("COMPLETED AT: %s",
			time.Now().Local().Format("Mon, 02 Jan 2006"),
		)
		entities := append(msg.Entities, models.MessageEntity{
			Type:   "bold",
			Offset: getLen(msgText) + 1,
			Length: getLen(completedAt),
		})
		_, err := b.EditMessageText(ctx, &bot.EditMessageTextParams{
			ChatID:    msg.Chat.ID,
			MessageID: msg.ID,
			Text: fmt.Sprintf("%s\n%s",
				msgText,
				completedAt,
			),
			ReplyMarkup: models.InlineKeyboardMarkup{
				InlineKeyboard: [][]models.InlineKeyboardButton{},
			},
			Entities: entities,
		})
		if err != nil {
			panic(err)
		}
	}
}

func messageHandler(ctx context.Context, b *bot.Bot, msg *models.Message, db *sqlx.DB) {
	slog.Debug(fmt.Sprintf(`Handling Message update from @%s with text "%s"`, msg.From.Username, msg.Text))
	switch msg.Chat.Type {
	case "private":
		routeMessage(ctx, b, msg, db)
	default:
		panic(fmt.Sprintf("Unexprected chat type: %s", msg.Chat.Type))
	}
}

func routeMessage(ctx context.Context, b *bot.Bot, msg *models.Message, db *sqlx.DB) {
	slog.Debug(fmt.Sprintf("Routing message from user id %d ...", msg.From.ID))

	if msg.Text == "/help" {
		slog.Debug("Routing to Help")
		cacheChadId(msg, db)
		help(ctx, b, msg)
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

func cacheChadId(msg *models.Message, db *sqlx.DB) {
	db.MustExec("INSERT OR REPLACE INTO TelegramUsers (Username, ChatId) VALUES (?, ?)", msg.From.Username, msg.Chat.ID)
}
