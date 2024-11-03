package main

import (
	"github.com/MetaGigachad/chad-apps/auth_service/internal/config"
	"github.com/MetaGigachad/chad-apps/auth_service/internal/http"
	"github.com/MetaGigachad/chad-apps/auth_service/internal/ory"
	"github.com/MetaGigachad/chad-apps/auth_service/internal/pg"
	. "github.com/MetaGigachad/chad-apps/libraries/go_common/pkg/log"
	. "github.com/MetaGigachad/chad-apps/libraries/go_common/pkg/utils"
	"go.uber.org/zap/zapcore"
)

func main() {
    config.InitConfigParser()
    config := config.LoadConfig()
    InitLogger(Must1(zapcore.ParseLevel(config.Log.Level)))
    defer Log.Sync()
    Log.Debugw("Loaded config", "config", *config)
    Log.Sync()

    pool := pg.NewConnectionPool(config)
    pg.SyncSchema(pool)
    defer pool.Close()

    hydra := ory.NewHydraAdminClient(config)
    ory.WaitAvaliability(hydra)
    ory.SyncClients(config, hydra.OAuth2API)

    listen := http.NewHttpServer(config, pool, hydra.OAuth2API)
    listen()
}
