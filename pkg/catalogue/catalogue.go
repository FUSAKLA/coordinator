package catalogue

import (
	"context"
	"fmt"
	"github.com/fsnotify/fsnotify"
	"github.com/sirupsen/logrus"
	"sync"
	"time"
)

type Catalogue interface {
	fmt.Stringer
	SetTeams([]Team)
	SyncWithFile(ctx context.Context, log *logrus.Entry, path string, interval time.Duration) error
	Teams() []Team
	TeamByServiceName(service string) []Team
	Team(id string) (Team, bool)
}

type Service struct {
	Name             string
	Description      string
	Url              string
	DashboardUrl     string
	DocumentationUrl string
	SourceCodeUrl    string
	ImChannelUrl     string
}

type OnCall struct {
	ScheduleName string
	Vendor       string
}

type Team struct {
	Id               string
	Name             string
	Email            string
	IMChannelURL     string
	DashboardURL     string
	DocumentationURL string
	Services         []Service
	OnCall           OnCall
}

func New() Catalogue {
	return &catalogue{
		mtx:   sync.RWMutex{},
		teams: []Team{},
	}
}

type catalogue struct {
	mtx   sync.RWMutex
	teams []Team
}

func (c *catalogue) String() string {
	return "team info catalogue"
}

func (c *catalogue) SetTeams(newTeams []Team) {
	if len(newTeams) == 0 {
		return
	}
	c.mtx.Lock()
	defer c.mtx.Unlock()
	c.teams = newTeams
}

func (c *catalogue) Teams() []Team {
	c.mtx.RLock()
	defer c.mtx.RUnlock()
	return c.teams
}

func (c *catalogue) TeamByServiceName(serviceName string) []Team {
	res := []Team{}
	for _, t := range c.Teams() {
		for _, s := range t.Services {
			if s.Name == serviceName {
				res = append(res, t)
			}
		}
	}
	return res
}

func (c *catalogue) Team(id string) (Team, bool) {
	c.mtx.RLock()
	defer c.mtx.RUnlock()
	for _, t := range c.teams {
		if t.Id == id {
			return t, true
		}
	}
	return Team{}, false
}

func (c *catalogue) SyncWithFile(ctx context.Context, log *logrus.Entry, path string, interval time.Duration) error {
	newTeams, err := LoadFromFile(path)
	if err != nil {
		return fmt.Errorf("error loading catalogue file: %v", err)
	}
	c.SetTeams(newTeams)
	log.Info("updated catalogue from file")
	watcher, err := fsnotify.NewWatcher()
	if err != nil {
		return fmt.Errorf("error watching catalogue file: %v", err)
	}
	if err := watcher.Add(path); err != nil {
		return fmt.Errorf("error watching catalogue file: %v", err)
	}
	for {
		select {
		case event, ok := <-watcher.Events:
			if !ok {
				return nil
			}
			if event.Op&fsnotify.Write != fsnotify.Write {
				continue
			}
			log.WithField("path", path).Info("synchronizing catalogue with file")
			newTeams, err := LoadFromFile(path)
			if err != nil {
				log.Errorf("failed to update catalogue from file: %v", err)
			} else {
				c.SetTeams(newTeams)
			}
		case err, ok := <-watcher.Errors:
			if !ok {
				return nil
			}
			log.Errorf("error watching catalogue file: %v", err)
		case <-ctx.Done():
			_ = watcher.Close()
			log.Info("stopping catalog file update")
			return nil
		}
	}
}
