package handlers

import (
	"context"
	"net/http"

	"github.com/MetaGigachad/chad-apps/auth_service/internal/ory"
	"github.com/gin-gonic/gin"
	"github.com/ory/client-go"
)

type Consent struct {
	ConsentChallenge string `json:"consent_challenge"`
}

func ConsentHandler(c *gin.Context) {
	var req Consent
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	oryConsentReq, _, err := ory.OAuth2.GetOAuth2ConsentRequest(context.Background()).ConsentChallenge(req.ConsentChallenge).Execute()
	if err != nil {
		panic(err)
	}

	if *oryConsentReq.Skip || *oryConsentReq.Client.SkipConsent {
		oryRedirectTo, _, err := ory.OAuth2.AcceptOAuth2ConsentRequest(context.Background()).ConsentChallenge(req.ConsentChallenge).AcceptOAuth2ConsentRequest(client.AcceptOAuth2ConsentRequest{
			GrantScope:               oryConsentReq.RequestedScope,
			GrantAccessTokenAudience: oryConsentReq.RequestedAccessTokenAudience,
		}).Execute()
		if err != nil {
			panic(err)
		}
		c.JSON(http.StatusOK, gin.H{"redirect_to": oryRedirectTo.RedirectTo})
		return
	}

	c.Status(http.StatusOK)
}
