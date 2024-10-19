package pg

import (
	"context"
	"time"

	log "github.com/sirupsen/logrus"

	"github.com/MetaGigachad/chad-apps/auth_service/internal/env"
	"github.com/jackc/pgx/v5/pgxpool"
)

var Pool *pgxpool.Pool

func init() {
	var err error
	Pool, err = pgxpool.New(context.Background(), env.PgConfig)
	if err != nil {
		log.Fatal("Unable to connect to database:", err)
	}

    log.Info("Waiting for successful db ping...")
    for {
        time.Sleep(time.Second)
        err = Pool.Ping(context.Background())
        if err != nil {
            log.Debug("Unsuccessful db ping")
        } else {
            break
        }
    }
	log.Info("Created connection pool to database with config:", Pool.Config())
}
