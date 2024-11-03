package ory

import (
	"context"

	"github.com/MetaGigachad/chad-apps/auth_service/internal/config"
	. "github.com/MetaGigachad/chad-apps/libraries/go_common/pkg/log"
	. "github.com/MetaGigachad/chad-apps/libraries/go_common/pkg/utils"
	ory "github.com/ory/client-go"
)

func NewHydraAdminClient(config *config.Config) *ory.APIClient {
	clientConfig := ory.NewConfiguration()
    if config.FeatureFlags.OryProxyHeaders {
        clientConfig.AddDefaultHeader("X-Forwarded-Proto", "https")
    }
	clientConfig.Servers = []ory.ServerConfiguration{{
        URL: config.Ory.AdminUrl,
	}}
	return ory.NewAPIClient(clientConfig)
}

func WaitAvaliability(hydra *ory.APIClient) {
    Log.Info("Waiting for OAuth2Admin API avaliablity...")
    ExpRetry(func() error {
        _, _, err := hydra.MetadataAPI.GetVersion(context.Background()).Execute()
        return err
    })
}

func SyncClients(config *config.Config, oauth2 ory.OAuth2API) {
    Log.Info("Syncing OAuth2 clients...")
    for _, clientConfig := range config.Ory.Clients {
        syncClient(&clientConfig, oauth2)
    }
    Log.Info("Finished syncing OAuth2 clients")
}

func syncClient(clientConfig *config.OAuth2ClientConfig, oauth2 ory.OAuth2API) {
    client, res, err := oauth2.GetOAuth2Client(context.Background(), clientConfig.Id).Execute()
    if res.StatusCode != 404 && err != nil {
        Log.Fatalw("Error checking client existance", "client", clientConfig, "error", err)
    }
    if client != nil {
        Log.Debugw("Found OAuth2 client", "Id", *client.ClientId, "Name", *client.ClientName)
        return
    }
    createClient(clientConfig, oauth2)
}

func createClient(clientConfig *config.OAuth2ClientConfig, oauth2 ory.OAuth2API) {
	c := ory.NewOAuth2Client()
    c.SetClientId(clientConfig.Id)
	c.SetClientName(clientConfig.Name)
	c.SetRedirectUris(clientConfig.RedirectUris)
	c.SetSkipConsent(true)
	c.SetGrantTypes([]string{"authorization_code", "refresh_token"})
	c.SetScope("openid offline")
	c.SetResponseTypes([]string{"code"})
	c.SetTokenEndpointAuthMethod("none")

    client, _ := Must2(oauth2.CreateOAuth2Client(context.Background()).OAuth2Client(*c).Execute())
    Log.Debugw("Created OAuth2 client", "Id", *client.ClientId, "Name", *client.ClientName)
}
