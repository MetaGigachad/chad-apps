package handlers

import (
	"context"
	"net/http"

	"github.com/MetaGigachad/chad-apps/auth_service/internal/ory"
	"github.com/MetaGigachad/chad-apps/auth_service/internal/pg"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
	"github.com/ory/client-go"
	"golang.org/x/crypto/bcrypt"
)

type Login struct {
	Username       string `json:"username"`
	Password       string `json:"password"`
	LoginChallenge string `json:"login_challenge"`
}

func LoginHandler(c *gin.Context) {
	var req Login
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var id string
	var password string
	if err := pg.Pool.QueryRow(context.Background(), `
		SELECT id, password FROM users WHERE username=$1
	`, req.Username).Scan(&id, &password); err == pgx.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "user doesn't exist"})
		return
	} else if err != nil {
		panic(err)
	}

	if err := bcrypt.CompareHashAndPassword([]byte(password), []byte(req.Password)); err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "invalid password"})
		return
	}

	// if _, _, err := ory.OAuth2.GetOAuth2LoginRequest(context.Background()).LoginChallenge(req.LoginChallenge).Execute(); err != nil {
	// 	panic(err)
	// }

	redirectTo, _, err := ory.OAuth2.AcceptOAuth2LoginRequest(context.Background()).LoginChallenge(req.LoginChallenge).AcceptOAuth2LoginRequest(client.AcceptOAuth2LoginRequest{
		Subject: id,
	}).Execute()
	if err != nil {
		panic(err)
	}

	c.JSON(http.StatusOK, gin.H{"redirect_to": redirectTo.RedirectTo})
}
