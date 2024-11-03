package config

import (
	"reflect"

	"github.com/gookit/config/v2"
	"github.com/gookit/config/v2/yaml"
	"github.com/iancoleman/strcase"
	"github.com/mitchellh/mapstructure"

	. "github.com/MetaGigachad/chad-apps/libraries/go_common/pkg/utils"
)

type Config struct {
	Postgres struct {
		ConfigStr string
	}
	Ory struct {
		AdminUrl string
		Clients []OAuth2ClientConfig
	}
	HttpServer struct {
		Host      string
		Port      uint16
        PathPrefix string
		DebugMode bool
	}
    FeatureFlags struct {
        OryProxyHeaders bool
    }
    Log struct {
        Level string
    }
}

type OAuth2ClientConfig struct {
    Id string
    Name string
    RedirectUris []string
}

func InitConfigParser() {
	config.WithOptions(config.ParseEnv)
	config.AddDriver(yaml.Driver)
	config.WithOptions(func(opt *config.Options) {
		opt.DecoderConfig = &mapstructure.DecoderConfig{
			TagName: "mapstructure",
            DecodeHook: mapstructure.ComposeDecodeHookFunc(
				func(f reflect.Type, t reflect.Type, data interface{}) (interface{}, error) {
					if f.Kind() == reflect.Map {
						newMap := reflect.MakeMap(f)
						for _, key := range reflect.ValueOf(data).MapKeys() {
							camelKey := strcase.ToCamel(key.String())
							newMap.SetMapIndex(reflect.ValueOf(camelKey), reflect.ValueOf(data).MapIndex(key))
						}
						return newMap.Interface(), nil
					}
					return data, nil
				},
			),
			Result: &Config{},
		}
	})
}

func LoadConfig() *Config {
	Must(config.LoadFiles("config/app.yaml"))
	cfg := Config{}
	config.Decode(&cfg)
	return &cfg
}
