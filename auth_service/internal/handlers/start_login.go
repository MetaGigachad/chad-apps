package handlers

import (
	"context"
	"net/http"

	"github.com/MetaGigachad/chad-apps/auth_service/internal/ory"
	"github.com/gin-gonic/gin"
	"github.com/ory/client-go"
)

type StartLogin struct {
	LoginChallenge string `json:"login_challenge"`
}

func StartLoginHandler(c *gin.Context) {
	var req StartLogin
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	oryLoginReq, _, err := ory.OAuth2.GetOAuth2LoginRequest(context.Background()).LoginChallenge(req.LoginChallenge).Execute()
	if err != nil {
		panic(err)
	}

	if oryLoginReq.Skip {
		oryRedirectTo, _, err := ory.OAuth2.AcceptOAuth2LoginRequest(context.Background()).LoginChallenge(req.LoginChallenge).AcceptOAuth2LoginRequest(client.AcceptOAuth2LoginRequest{
			Subject: oryLoginReq.Subject,
		}).Execute()
		if err != nil {
			panic(err)
		}
		c.JSON(http.StatusOK, gin.H{"redirect_to": oryRedirectTo.RedirectTo})
		return
	}

	c.Status(http.StatusOK)
}
