package catalogue

import (
	"gopkg.in/yaml.v2"
	"io/ioutil"
	"strconv"
)

type OnCallConfig struct {
	ScheduleName string `yaml:"schedule_name"`
	Vendor       string `yaml:"vendor"`
}

type TeamConfig struct {
	Name             string        `yaml:"name"`
	Email            string        `yaml:"email,omitempty"`
	IMChannelURL     string        `yaml:"im_channel_url,omitempty"`
	DocumentationURL string        `yaml:"documentation_url,omitempty"`
	DashboardURL     string        `yaml:"dashboard_url,omitempty"`
	Services         []string      `yaml:"managed_services"`
	OnCall           *OnCallConfig `yaml:"on_call,omitempty"`
}

type Config struct {
	Teams []TeamConfig `yaml:"teams"`
}

func (c *Config) validate() error {
	return nil
}

func LoadFromFile(path string) ([]Team, error) {
	config, err := ioutil.ReadFile(path)
	if err != nil {
		return nil, err
	}
	var c Config
	if err := yaml.Unmarshal(config, &c); err != nil {
		return nil, err
	}
	teams := make([]Team, len(c.Teams))
	for i, t := range c.Teams {
		teams[i] = Team{
			Id:               strconv.Itoa(i),
			Name:             t.Name,
			Email:            t.Email,
			IMChannelURL:     t.IMChannelURL,
			DashboardURL:     t.DashboardURL,
			DocumentationURL: t.DocumentationURL,
			Services:         t.Services,
		}
		if t.OnCall != nil {
			teams[i].OnCall = OnCall{
				ScheduleName: t.OnCall.ScheduleName,
				Vendor:       t.OnCall.Vendor,
			}
		}
	}
	return teams, nil
}
