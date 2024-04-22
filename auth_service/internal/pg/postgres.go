package pg

import (
	"context"

	log "github.com/sirupsen/logrus"

	"github.com/MetaGigachad/chad-apps/auth_service/internal/env"
	"github.com/jackc/pgx/v5/pgxpool"
)

var Pool pgxpool.Pool

func init() {
	Pool, err := pgxpool.New(context.Background(), env.PgConfig)
	if err != nil {
		log.Fatal("Unable to connect to database:", err)
	}

	err = Pool.Ping(context.Background())
	if err != nil {
		log.Fatal("Error pinging database:", err)
	}
	log.Info("Created connection pool to database with config:", Pool.Config())
}
