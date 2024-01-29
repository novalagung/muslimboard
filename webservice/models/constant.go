package models

import "time"

const ProjectName = "muslimboard"
const RedisKeepAliveDuration = time.Hour * 24 * 3

func Namespace(namespace string) string {
	return ProjectName + "." + namespace
}
