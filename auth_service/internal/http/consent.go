package http

import (
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
	ory "github.com/ory/client-go"
	. "github.com/MetaGigachad/chad-apps/libraries/go_common/pkg/log"
)

type Consent struct {
	ConsentChallenge string `json:"consent_challenge"`
}

func ConsentHandler(c *gin.Context) {
    oauth2 := c.MustGet("oauth2").(ory.OAuth2API)

	var req Consent
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	oryConsentReq, _, err := oauth2.GetOAuth2ConsentRequest(context.Background()).ConsentChallenge(req.ConsentChallenge).Execute()
	if err != nil {
		panic(err)
	}

    Log.Debugw("Consent request info", "req", oryConsentReq)

	if *oryConsentReq.Skip || true {
		oryRedirectTo, _, err := oauth2.AcceptOAuth2ConsentRequest(context.Background()).ConsentChallenge(req.ConsentChallenge).AcceptOAuth2ConsentRequest(ory.AcceptOAuth2ConsentRequest{
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
