package http

import (
	"context"
	"fmt"
	"net/http"
	"os/signal"
	"syscall"
	"time"

	"github.com/MetaGigachad/chad-apps/auth_service/internal/config"
	. "github.com/MetaGigachad/chad-apps/libraries/go_common/pkg/log"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	ory "github.com/ory/client-go"
)

func NewHttpServer(config *config.Config, pg *pgxpool.Pool, oauth2 ory.OAuth2API) func() {
	if !config.HttpServer.DebugMode {
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.New()

    router.Use(func(c *gin.Context) {
        c.Set("config", config)
        c.Set("postgres", pg)
        c.Set("oauth2", oauth2)
        c.Next()
    })

    mainApi := router.Group(config.HttpServer.PathPrefix)

	mainApi.POST("/ping", func(ctx *gin.Context) {
		ctx.String(http.StatusOK, "pong")
	})

	mainApi.POST("/register", RegisterHandler)

	mainApi.POST("/startLogin", StartLoginHandler)
	mainApi.POST("/login", LoginHandler)
	mainApi.POST("/denyLogin", DenyLoginHandler)

	mainApi.POST("/consent", ConsentHandler)

    return func() {
        Listen(router, fmt.Sprintf("%s:%d", config.HttpServer.Host, config.HttpServer.Port))
    }
}

func Listen(router *gin.Engine, addr string) {
	srv := &http.Server{
		Addr:    addr,
		Handler: router,
	}

	go func() {
        Log.Infof("Server listening on %s...", addr)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			Log.Fatal("HttpServer lister failed unexpected", err)
		}
	}()

    // Graceful shutdown
    ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
    <-ctx.Done()
    stop()

    Log.Info("Starting graceful shutdown")
	ctx, cancel := context.WithTimeout(context.Background(), 5 * time.Second)
	defer cancel()
	Log.Info("Shutdown Server ...")
	if err := srv.Shutdown(ctx); err != nil {
		Log.Fatal("Server shutdown failed unexpected", err)
	}
	Log.Info("Server shutdown complete")
}
