package logger

import (
	"github.com/sirupsen/logrus"
)

var Log = logrus.New()

func Init() {
	Log.Infoln("initializing logger")
	Log.SetLevel(logrus.DebugLevel)
}
