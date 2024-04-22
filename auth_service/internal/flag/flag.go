package flag

import (
	"flag"
	"fmt"
)

var Help = flag.Bool("help", false, "Display this help message")

func init() {
	flag.Parse()
	if *Help {
		flag.PrintDefaults()
		fmt.Print(EnvironmentHelp)
		return
	}
}

var EnvironmentHelp = `
Environment Variables:
    HOST                [Default: "localhost"]     Server host
    POST                [Default: 8080]          Http listening port
    ORY_URL             [Required]                 Url to ory hydra api
    OAUTH2_CLIENT_NAME  [Default: "auth_service"]  Name for OAuth2 client used by this service
    OAUTH2_CLIENT_ID    [Default: nil]             Id for OAuth2 client used by this service
	PG_CONFIG           [Required]                 Postgres connection configuration string
`

func InitBefore() {}
