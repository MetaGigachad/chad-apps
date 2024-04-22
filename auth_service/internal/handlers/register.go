package handlers

import (
	"context"
	"net/http"
	"time"

	"github.com/MetaGigachad/chad-apps/auth_service/internal/pg"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

type Register struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

func RegisterHandler(c *gin.Context) {
	var req Register
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	passwordHash, err := bcrypt.GenerateFromPassword([]byte(req.Password), 10)
	if err != nil {
		panic(err)
	}

	res, err := pg.Pool.Exec(context.Background(), `
		INSERT INTO users (username, password, created_at) VALUES ($1, $2, $3) ON CONFLICT (username) DO NOTHING
	`, req.Username, string(passwordHash), time.Now())
	if err != nil {
		panic(err)
	}
	if res.RowsAffected() == 0 {
		c.JSON(http.StatusConflict, gin.H{"error": "Username is already taken"})
		return
	}

	c.Status(http.StatusOK)
}
