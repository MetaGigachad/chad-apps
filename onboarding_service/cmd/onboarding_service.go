package main

import (
	"log/slog"
	"os"
	"os/signal"
	"sync"
	"syscall"

	mybot "github.com/MetaGigachad/chad-apps/onboarding_service/internals/bot"
	"github.com/MetaGigachad/chad-apps/onboarding_service/internals/config"
	"github.com/MetaGigachad/chad-apps/onboarding_service/internals/db"
	"github.com/MetaGigachad/chad-apps/onboarding_service/internals/http_api"
	"github.com/MetaGigachad/chad-apps/onboarding_service/internals/jobs"
	mylog "github.com/MetaGigachad/chad-apps/onboarding_service/internals/log"
)

func main() {
	config := config.LoadConfig()
	mylog.InitLogger()
	db := db.OpenDB(config.Database.Path)
	bot := mybot.MakeBot(&config, db)

    var wg sync.WaitGroup
	stopChan := make(chan struct{})

    wg.Add(3)
	go http_api.ListenAndServe(&config, db, stopChan, &wg)
	go jobs.StartScheduler(bot.Bot, db, stopChan, &wg)
	go bot.Serve(stopChan, &wg)

	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	<-sigChan
	close(stopChan)
	wg.Wait()
	slog.Info("Successful full shutdown")
}
