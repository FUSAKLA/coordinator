package catalogue

import (
	"gopkg.in/yaml.v2"
	"io/ioutil"
	"strconv"
)

type ServiceConfig struct {
	Name             string `yaml:"name"`
	Description      string `yaml:"description"`
	Url              string `yaml:"url"`
	DashboardUrl     string `yaml:"dashboard_url"`
	DocumentationUrl string `yaml:"documentation_url"`
	SourceCodeUrl    string `yaml:"source_code_url"`
	ImChannelUrl     string `yaml:"im_channel_url"`
}

type OnCallConfig struct {
	ScheduleName string `yaml:"schedule_name"`
	Vendor       string `yaml:"vendor"`
}

type TeamConfig struct {
	Name             string          `yaml:"name"`
	Email            string          `yaml:"email,omitempty"`
	IMChannelURL     string          `yaml:"im_channel_url,omitempty"`
	DocumentationURL string          `yaml:"documentation_url,omitempty"`
	DashboardURL     string          `yaml:"dashboard_url,omitempty"`
	Services         []ServiceConfig `yaml:"managed_services"`
	OnCall           *OnCallConfig   `yaml:"on_call,omitempty"`
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
			Services:         []Service{},
		}
		if t.OnCall != nil {
			teams[i].OnCall = OnCall{
				ScheduleName: t.OnCall.ScheduleName,
				Vendor:       t.OnCall.Vendor,
			}
		}
		for _, s := range t.Services {
			teams[i].Services = append(
				teams[i].Services,
				Service{
					Name:             s.Name,
					Description:      s.Description,
					Url:              s.Url,
					DashboardUrl:     s.DashboardUrl,
					DocumentationUrl: s.DocumentationUrl,
					SourceCodeUrl:    s.SourceCodeUrl,
					ImChannelUrl:     s.ImChannelUrl,
				},
			)
		}
	}
	return teams, nil
}
