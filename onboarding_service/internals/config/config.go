package config

import (
	"log/slog"

	"github.com/gookit/config/v2"
	"github.com/gookit/config/v2/yaml"
)

type Config struct {
	Bot struct {
		Token   string `mapstructure:"token"`
	} `mapstructure:"bot"`
	Database struct {
		Path string `mapstructure:"path"`
	} `mapstructure:"database"`
	HttpAPI struct {
		Host string `mapstructure:"host"`
		Port string `mapstructure:"port"`
        PathPrefix string `mapstructure:"path_prefix"`
	} `mapstructure:"http_api"`
	Ory struct {
		Url string `mapstructure:"url"`
	} `mapstructure:"ory"`
    FrontendConfig struct {
        OAuth2 struct {
            AuthUrl string `mapstructure:"auth_url"`
            TokenUrl string `mapstructure:"token_url"`
            ClientId string `mapstructure:"client_id"`
            RedirectUri string `mapstructure:"redirect_uri"`
        } `mapstructure:"oauth2"`
    } `mapstructure:"frontend_config"`
}

func LoadConfig() Config {
	slog.Info("Loading config...")
	config.AddDriver(yaml.Driver)
	err := config.LoadFiles("config/app.yml")
	if err != nil {
		panic(err)
	}
	cfg := Config{}
	config.Decode(&cfg)
	slog.Debug("Loaded config", "content", cfg)
	return cfg
}
