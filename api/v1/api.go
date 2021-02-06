package v1

import (
	"github.com/fusakla/coordinator/api"
	"github.com/fusakla/coordinator/pkg/catalogue"
	"github.com/fusakla/coordinator/pkg/oncall"
	"github.com/fusakla/coordinator/pkg/storage"
	"github.com/gorilla/mux"
	"github.com/gorilla/sessions"
	"github.com/sirupsen/logrus"
)

func New(logger *logrus.Entry, sessionStore sessions.Store, eventStore storage.Storage, cat catalogue.Catalogue, onCall oncall.Manager) *Api {
	return &Api{
		log:          logger,
		sessionStore: &api.SessionStore{Store: sessionStore},
		storage:      eventStore,
		catalogue:    cat,
		onCall:       onCall,
	}
}

type Api struct {
	log          *logrus.Entry
	sessionStore *api.SessionStore
	storage      storage.Storage
	catalogue    catalogue.Catalogue
	onCall       oncall.Manager
}

func (a Api) Register(router *mux.Router) {
	a.registerEventApi(router.PathPrefix("/events").Subrouter())
	a.registerTeamsApi(router.PathPrefix("/teams").Subrouter())
}
