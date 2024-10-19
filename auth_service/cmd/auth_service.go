package main

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/MetaGigachad/chad-apps/auth_service/internal/env"
	"github.com/MetaGigachad/chad-apps/auth_service/internal/handlers"
	"github.com/MetaGigachad/chad-apps/auth_service/internal/pg"
	"github.com/gin-gonic/gin"
	log "github.com/sirupsen/logrus"
)

func main() {
	defer pg.Pool.Close()

	gin.DefaultWriter = log.StandardLogger().Out
	gin.DefaultErrorWriter = log.StandardLogger().Out
	if !env.Debug {
		gin.SetMode(gin.ReleaseMode)
	}
	gin.DefaultWriter = io.MultiWriter(log.StandardLogger().Out, os.Stdout)

	router := gin.New()

	router.Use(GinLogrus(log.StandardLogger()))
	router.Use(gin.CustomRecovery(func(c *gin.Context, recovered any) {
		if err, ok := recovered.(string); ok && env.Debug {
			c.String(http.StatusInternalServerError, fmt.Sprintf("error: %s", err))
		}
		c.AbortWithStatus(http.StatusInternalServerError)
	}))

	router.POST("/ping", func(ctx *gin.Context) {
		ctx.String(http.StatusOK, "pong")
	})

	router.POST("/register", handlers.RegisterHandler)

	router.POST("/startLogin", handlers.StartLoginHandler)
	router.POST("/login", handlers.LoginHandler)
	router.POST("/denyLogin", handlers.DenyLoginHandler)

	router.POST("/consent", handlers.ConsentHandler)

	StartServer(router, fmt.Sprintf("%s:%d", env.Host, env.Port))
}

func StartServer(router *gin.Engine, addr string) {
	srv := &http.Server{
		Addr:    addr,
		Handler: router,
	}

	go func() {
        log.Infof("Server listening on %s...\n", addr)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("listen: %s\n", err)
		}
	}()

    // Graceful shutdown
    ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
    <-ctx.Done()
    stop()

    log.Info("Starting graceful shutdown")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
    log.Info("Closing postgres pool ...")
    pg.Pool.Close()
	log.Info("Shutdown Server ...")
	if err := srv.Shutdown(ctx); err != nil {
		log.Fatal("Server Shutdown:", err)
	}
	log.Info("Server shutdown complete")
}

func GinLogrus(logger *log.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()

		c.Next()

		logger.WithFields(log.Fields{
			"method": c.Request.Method,
			"uri":    c.Request.RequestURI,
			"status": c.Writer.Status(),
			"took":   time.Since(start),
		}).Info("Request processed")
	}
}
