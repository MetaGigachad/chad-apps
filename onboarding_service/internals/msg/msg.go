package msg

import (
	jsoniter "github.com/json-iterator/go"
	"unicode"
)

func pascalToCamelCase(str string) string {
	if str == "" {
		return str
	}
	runes := []rune(str)
	runes[0] = unicode.ToLower(runes[0])
	return string(runes)
}

type toCamelCaseExtension struct {
	jsoniter.DummyExtension
}

func (e *toCamelCaseExtension) UpdateStructDescriptor(structDescriptor *jsoniter.StructDescriptor) {
	for _, binding := range structDescriptor.Fields {
		names := []string{pascalToCamelCase(binding.Field.Name())}
		binding.FromNames = names
		binding.ToNames = names
	}
}

func MakeJsonAPI() jsoniter.API {
	json := jsoniter.ConfigCompatibleWithStandardLibrary
	json.RegisterExtension(&toCamelCaseExtension{})
	return json
}

type FrontendConfig struct {
    OAuth2 FrontendConfigOAuth2
}

type FrontendConfigOAuth2 struct {
    AuthUrl string
    TokenUrl string
    ClientId string
    RedirectUri string
}

type Plan struct {
    TextId string
    Name string
}

type FeedInfoBlock struct {
	Type    string
	Day     int64
	Content string
}

type AssignTaskBlock struct {
	Type        string
	Interval    []int64
	Name        string
	Description string
}

type MetaBlock struct {
	Type  string
	Key   string
	Value string
}

type Deployment struct {
	PlanTextId       string
	TelegramUsername string
}
