package main

import (
	"fmt"
	"io"
	"net/http"
	"os"
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

	router.POST("/login", handlers.LoginHandler)
	router.POST("/register", handlers.RegisterHandler)

	log.Infof("Server listening on %s:%d...\n", env.Host, env.Port)
	http.ListenAndServe(fmt.Sprintf("%s:%d", env.Host, env.Port), nil)
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
