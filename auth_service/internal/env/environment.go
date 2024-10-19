package env

import (
	"os"
	"strconv"
	"strings"

	"github.com/MetaGigachad/chad-apps/auth_service/internal/flag"
	log "github.com/sirupsen/logrus"
)

var (
	Host                     string
	Port                     uint16
	OryUrl                   string
	OAuth2ClientName         string
	OAuth2ClientId           *string
	OAuth2ClientRedirectUris []string
	PgConfig                 string
	Debug                    bool
)

func init() {
	flag.InitBefore()

	host := os.Getenv("HOST")
	if host == "" {
		host = "0.0.0.0"
	}
	Host = host

	port := os.Getenv("PORT")
	if port == "" {
		Port = 80
	} else {
		val, err := strconv.ParseUint(port, 10, 16)
		if err != nil {
			log.Fatal("Failed parsing PORT variable:", err)
		}
		Port = uint16(val)
	}

	oryUrl := os.Getenv("ORY_URL")
	if oryUrl == "" {
		log.Fatal("ORY_URL is not provided")
	}
	OryUrl = oryUrl

	oAuth2ClientName := os.Getenv("OAUTH2_CLIENT_NAME")
	if oAuth2ClientName == "" {
		oAuth2ClientName = "auth_service"
	}
	OAuth2ClientName = oAuth2ClientName

	oAuth2ClientId := os.Getenv("OAUTH2_CLIENT_ID")
	if oAuth2ClientId == "" {
		OAuth2ClientId = nil
	} else {
		OAuth2ClientId = &oAuth2ClientId
	}

	oAuth2ClientRedirectUris := os.Getenv("OAUTH2_CLIENT_REDIRECT_URIS")
	if oAuth2ClientRedirectUris == "" {
		log.Warn("OAUTH2_CLIENT_REDIRECT_URIS is not provided")
	} else {
		OAuth2ClientRedirectUris = strings.Split(oAuth2ClientRedirectUris, " ")
	}

	PgConfig = os.Getenv("PG_CONFIG")

	debug := os.Getenv("DEBUG")
	if debug != "" {
		bDebug, err := strconv.ParseBool(debug)
		if err != nil {
			log.Fatal("Failed parsing DEBUG variable:", err)
		}
		Debug = bDebug
	}
}
