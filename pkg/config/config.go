package config

import (
	"fmt"
	"github.com/creasty/defaults"
	"gopkg.in/yaml.v2"
	"io/ioutil"
	"time"
)

type GitLabConfig struct {
	Enabled          bool   `yaml:"enabled" default:"false"`
	BaseURL          string `yaml:"base_url" defaulf:"https://gitlab.com"`
	Project          string `yaml:"project"`
	IncidentLabel    string `yaml:"incident_label" default:"incident"`
	MaintenanceLabel string `yaml:"maintenance_label" default:"maintenance"`
	NoticeLabel      string `yaml:"notice_label" default:"notice"`
}

type GitHubConfig struct {
	Enabled          bool   `yaml:"enabled" default:"false"`
	Project          string `yaml:"project"`
	IncidentLabel    string `yaml:"incident_label" default:"incident"`
	MaintenanceLabel string `yaml:"maintenance_label" default:"maintenance"`
	NoticeLabel      string `yaml:"notice_label" default:"notice"`
}

type StorageConfig struct {
	OAuthCallbackBaseURL string       `yaml:"oauth_callback_base_url,omitempty"`
	GitLab               GitLabConfig `yaml:"gitlab"`
	GitHub               GitHubConfig `yaml:"github"`
}

type MattermostConfig struct {
	Enabled bool   `yaml:"enabled" default:"false"`
	BaseURL string `yaml:"base-url"`
}

type SlackConfig struct {
	Enabled bool   `yaml:"enabled" default:"false"`
	BaseURL string `yaml:"base-url"`
}

type IMConfig struct {
	Mattermost MattermostConfig `yaml:"mattermost"`
	Slack      SlackConfig      `yaml:"slack"`
}

type OpsGenieConfig struct {
	Enabled        bool          `yaml:"enabled" default:"false"`
	ApiURL         string        `yaml:"api-url" default:"api.opsgenie.com"`
	LogLevel       string        `yaml:"log-level" default:"info"`
	MaxRetries     int           `yaml:"max-retries" default:"3"`
	RequestTimeout time.Duration `yaml:"request-timeout" default:"1m"`
}

type PagerDutyConfig struct {
	Enabled bool `yaml:"enabled" default:"false"`
}

type OnCallVendorConfig struct {
	OpsGenie  OpsGenieConfig  `yaml:"opsgenie"`
	PagerDuty PagerDutyConfig `yaml:"pagerduty"`
}

type CatalogueConfig struct {
	Enabled  bool   `yaml:"enabled" default:"false"`
	FilePath string `yaml:"file"`
}

type Config struct {
	Storage   StorageConfig      `yaml:"storage"`
	Catalogue CatalogueConfig    `yaml:"catalogue"`
	OnCall    OnCallVendorConfig `yaml:"on-call-providers"`
	ImConfig  IMConfig           `yaml:"instant-messaging"`
}

func (c *Config) validate() error {
	return nil
}

func NewFromFile(path string) (*Config, error) {
	file, err := ioutil.ReadFile(path)
	if err != nil {
		return nil, err
	}
	return New(file)
}

func New(config []byte) (*Config, error) {
	var c Config
	if err := defaults.Set(&c); err != nil {
		return nil, err
	}
	if err := yaml.Unmarshal(config, &c); err != nil {
		return nil, err
	}
	if err := c.validate(); err != nil {
		return nil, fmt.Errorf("invalid config: %w", err)
	}
	return &c, nil
}
