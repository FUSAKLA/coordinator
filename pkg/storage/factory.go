package storage

import (
	"fmt"
	"github.com/fusakla/coordinator/pkg/config"
)

type StoreType string

const (
	GitLab StoreType = "gitlab"
)

type Opts struct {
	StoreType *string

	OAuthAppKeyFile    *string
	OAuthSecretKeyFile *string
	OAuthCallbackUrl   *string

	GitlabBaseUrl   *string
	GitlabTokenFile *string
	GitlabProject   *string
}

func New(config config.StorageConfig) (Storage, error) {
	if config.GitLab.Enabled {
		return newGitlabStore(config.OAuthCallbackBaseURL, config.GitLab)
	}
	if config.GitHub.Enabled {
		return nil, fmt.Errorf("GitHub storage is not yet implemented")
	}
	return nil, fmt.Errorf("you have to enable any of supported storages")
}
