package v1

import (
	"github.com/fusakla/coordinator/pkg/eventstore"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func New(logger *logrus.Entry, eventStore eventstore.EventStore) *Api {
	return &Api{log: logger, store: eventStore}
}

type Api struct {
	log   *logrus.Entry
	store eventstore.EventStore
}

func (a Api) Register(router *gin.RouterGroup, ) {
	a.registerEventApi(router.Group("/events"))
}
