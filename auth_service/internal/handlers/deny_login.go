package handlers
import (
	"context"
	"net/http"

	"github.com/MetaGigachad/chad-apps/auth_service/internal/ory"
	"github.com/gin-gonic/gin"
	"github.com/ory/client-go"
)

type DenyLogin struct {
	LoginChallenge string `json:"login_challenge"`
}

func DenyLoginHandler(c *gin.Context) {
	var req DenyLogin
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	error := "access_denied"
	errorDescription := "The resource owner denied the request"
	oryRedirectTo, _, err := ory.OAuth2.RejectOAuth2LoginRequest(context.Background()).LoginChallenge(req.LoginChallenge).RejectOAuth2Request(client.RejectOAuth2Request{
		Error:            &error,
		ErrorDescription: &errorDescription,
	}).Execute()
	if err != nil {
		panic(err)
	}
	c.JSON(http.StatusOK, gin.H{"redirect_to": oryRedirectTo.RedirectTo})
}
