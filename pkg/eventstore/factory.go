package eventstore

import (
	"fmt"
)

type StoreType string

const (
	GitLab StoreType = "gitlab"
)

var SupportedStoreTypes = []string{string(GitLab)}

type Opts struct {
	StoreType       *string
	GitlabUrl       *string
	GitlabTokenFile *string
	GitlabProject   *string
}

func New(opts Opts) (EventStore, error) {
	switch StoreType(*opts.StoreType) {
	case GitLab:
		return newGitlabStore(opts)
	default:
		return nil, fmt.Errorf("unsupported store type: %s", *opts.StoreType)
	}
}
