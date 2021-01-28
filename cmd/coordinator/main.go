package main

import (
	v1 "github.com/fusakla/coordinator/api/v1"
	"github.com/fusakla/coordinator/pkg/eventstore"
	"github.com/gin-gonic/gin"
	log "github.com/sirupsen/logrus"
	"gopkg.in/alecthomas/kingpin.v2"
)

var (
	storeOpts = eventstore.Opts{
		StoreType:       kingpin.Flag("storage", "Storage to use").Required().Enum(eventstore.SupportedStoreTypes...),
		GitlabUrl:       kingpin.Flag("gitlab-url", "GitLab API URL.").Default("https://gitlab.com/api/v4").String(),
		GitlabTokenFile: kingpin.Flag("gitlab-token-file", "Path to file with GitLab API token.").Required().ExistingFile(),
		GitlabProject:   kingpin.Flag("gitlab-project", "GitLab project.").Required().String(),
	}
)

func main() {
	kingpin.Parse()

	store, err := eventstore.New(storeOpts)
	if err != nil {
		log.Fatalf("Invalid store options: %v", err)
	}

	r := gin.Default()

	apiV1 := v1.New(log.WithField("api", "v1"), store)
	apiV1.Register(r.Group("/api/v1"))

	log.Infof("Starting server, listening on: http://0.0.0.0:8080")
	if err := r.Run(); err != nil {
		log.Fatalf("Error starting server: %v", err)
	}
}
