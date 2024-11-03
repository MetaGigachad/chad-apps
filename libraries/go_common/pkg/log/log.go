package log

import (
	"time"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

var Log *zap.SugaredLogger

func InitLogger(level zapcore.Level) {
    loggerConfig := zap.NewProductionConfig()
    loggerConfig.Level.SetLevel(level)

    loggerConfig.EncoderConfig.TimeKey = "ts"
    loggerConfig.EncoderConfig.EncodeTime = func(t time.Time, enc zapcore.PrimitiveArrayEncoder) {
        enc.AppendString(t.Format("2006-01-02 15:04:05"))
    }

    logger, _ := loggerConfig.Build()
    Log = logger.Sugar()
}

