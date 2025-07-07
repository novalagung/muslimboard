package logger

import (
	"os"

	"github.com/sirupsen/logrus"
)

var Log = logrus.New()

func Init() {
	Log.Infoln("initializing logger")

	level, err := logrus.ParseLevel(os.Getenv("LOG_LEVEL"))
	if err != nil {
		level = logrus.InfoLevel
	}

	Log.SetLevel(level)
}
