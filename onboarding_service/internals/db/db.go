package db

import (
	"database/sql"
	"log/slog"
	"os"
	"path"

	"github.com/jmoiron/sqlx"
	_ "github.com/mattn/go-sqlite3"
)

var schema = `
CREATE TABLE IF NOT EXISTS Users (
    Id INTEGER NOT NULL PRIMARY KEY,
    OAuthUserId TEXT UNIQUE NOT NULL,
    Username TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS TelegramUsers (
    Id INTEGER NOT NULL PRIMARY KEY,
    Username TEXT UNIQUE NOT NULL,
    ChatId INTEGER UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS Plans (
    Id INTEGER NOT NULL PRIMARY KEY,
    OwnerId INTEGER NOT NULL,
    TextId TEXT NOT NULL,
    Name TEXT NOT NULL,
    UNIQUE(OwnerId, TextId),
    FOREIGN KEY (OwnerId) REFERENCES Users (Id)
);

CREATE TABLE IF NOT EXISTS PlanBlocks (
    Id INTEGER NOT NULL PRIMARY KEY,
    NextId INTEGER,
    PlanId INTEGER,
    Type TEXT NOT NULL,
    Day INTEGER,
    Content TEXT,
    IntervalStart INTEGER,
    IntervalEnd INTEGER,
    Name TEXT,
    Description TEXT,
    Key TEXT,
    Value TEXT,
    FOREIGN KEY (PlanId) REFERENCES Plans (Id)
);

CREATE TABLE IF NOT EXISTS Deployments (
    Id INTEGER NOT NULL PRIMARY KEY,
    OwnerId INTEGER NOT NULL,
    PlanTextId INTEGER NOT NULL,
    TelegramUsername TEXT NOT NULL,
    CurrentBlockId INTEGER,
    CurrentDay INTEGER NOT NULL,
    UNIQUE(TelegramUsername),
    FOREIGN KEY (OwnerId) REFERENCES Users (Id),
    FOREIGN KEY (PlanTextId) REFERENCES Plans (TextId),
    FOREIGN KEY (CurrentBlockId) REFERENCES PlanBlocks (Id)
);
`

type User struct {
	Id          int64
	OAuthUserId string
	Username    string
}

type TelegramUser struct {
    Id int64
    Username string
    ChatId string
}

type Plan struct {
    Id int64
    OwnerId int64
    TextId string
    Name string
}

type PlanBlock struct {
    Id int64
    NextId sql.NullInt64
    PlanId sql.NullInt64
    Type string
    Day sql.NullInt64
    Content sql.NullString
    IntervalStart sql.NullInt64
    IntervalEnd sql.NullInt64
    Name sql.NullString
    Description sql.NullString
    Key sql.NullString
    Value sql.NullString
}

type Deployment struct {
    Id int64
    OwnerId int64
    PlanTextId string
    TelegramUsername string
    CurrentBlockId sql.NullInt64
    CurrentDay int64
}

func OpenDB(dbPath string) *sqlx.DB {
	slog.Info("Opening database...")
	if _, err := os.Stat(dbPath); os.IsNotExist(err) {
		os.MkdirAll(path.Dir(dbPath), 0755)
		os.Create(dbPath)
	} else if err != nil {
		panic(err)
	}

	db, err := sqlx.Open("sqlite3", dbPath+"?_busy_timeout=1000")
	if err != nil {
		panic(err)
	}
	db.MapperFunc(func(s string) string { return s })
	db.MustExec(schema)

	return db
}
