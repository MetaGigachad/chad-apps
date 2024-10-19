package config

import (
	"log/slog"

	"github.com/gookit/config/v2"
	"github.com/gookit/config/v2/yaml"
)

type Config struct {
	Bot struct {
		Token   string `mapstructure:"token"`
		WebHook struct {
			HostUrl    string `mapstructure:"host_url"`
			ListenHost string `mapstructure:"listen_host"`
			ListenPort string `mapstructure:"listen_port"`
		} `mapstructure:"webhook"`
		AdminIds []int64 `mapstructure:"admin_ids"`
	} `mapstructure:"bot"`
	Database struct {
		Path string `mapstructure:"path"`
	} `mapstructure:"database"`
	HttpAPI struct {
		Host string `mapstructure:"host"`
		Port string `mapstructure:"port"`
	} `mapstructure:"http_api"`
	Ory struct {
		Url string `mapstructure:"url"`
	} `mapstructure:"ory"`
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
