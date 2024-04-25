package ory

import (
	"context"
	"net/http"

	"github.com/MetaGigachad/chad-apps/auth_service/internal/env"
	ory "github.com/ory/client-go"
	log "github.com/sirupsen/logrus"
)

var OAuth2 ory.OAuth2API
var ClientName string
var ClientId *string

func init() {
	ClientName = env.OAuth2ClientName
	ClientId = env.OAuth2ClientId

	configuration := ory.NewConfiguration()
	configuration.Servers = []ory.ServerConfiguration{
		{
			URL: env.OryUrl,
		},
	}
	oauth2 := ory.NewAPIClient(configuration).OAuth2API
	OAuth2 = oauth2

	// Try fetching existing client
	clients, r, err := oauth2.ListOAuth2Clients(context.Background()).ClientName(ClientName).Execute()
	if err != nil {
		log.Fatalf("Error when calling `AdminApi.ListOAuth2Clients`: %v\nFull HTTP response: %v\n", err, r)
	}
	if len(clients) > 1 {
		log.Fatalf("Unexpected amount of oauth2 clients with name `%s`: %d\n", ClientName, len(clients))
	}
	if len(clients) == 1 {
		client := clients[0]
		if ClientId != nil && *ClientId != *client.ClientId {
			log.Fatalf("OAuth2 client with name `%s` has id `%s`, but id `%s` was expected\n", ClientName, *client.ClientId, *ClientId)
		}
		ClientId = client.ClientId
		log.Infof("Using OAuth2 client with name `%s` and id `%s`\n", ClientName, ClientId)
		return
	}

	// Create new client
	client := *ory.NewOAuth2Client()
	client.SetClientName(ClientName)
	if ClientId != nil {
		client.SetClientId(*ClientId)
	}
	client.SetRedirectUris(env.OAuth2ClientRedirectUris)
	client.SetSkipConsent(true)
	resp, r, err := oauth2.CreateOAuth2Client(context.Background()).OAuth2Client(client).Execute()
	if err != nil {
		switch r.StatusCode {
		case http.StatusConflict:
			log.Fatalf("Conflict when creating oAuth2Client: %v\n", err)
		default:
			log.Fatalf("Error when calling `OAuth2Api.CreateOAuth2Client`: %v\nFull HTTP response: %v\n", err, r)
		}
	}
	log.Infof("Created new oAuth2Client named `%s` with id: %s", ClientName, *resp.ClientId)
	ClientId = resp.ClientId
}
