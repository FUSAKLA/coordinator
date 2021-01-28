package v1

import (
	"github.com/fusakla/coordinator/pkg/eventstore"
	"github.com/gin-gonic/gin"
	"net/http"
	"time"
)

type User struct {
	Name      string `json:"name"`
	Email     string `json:"email"`
	AvatarUrl string `json:"avatar_url"`
}

type EventComment struct {
	Author User   `json:"author"`
	Text   string `json:"text"`
}

type Event struct {
	Id                string    `json:"id"`
	Type              string    `json:"type"`
	Title             string    `json:"title"`
	Start             time.Time `json:"start"`
	End               time.Time `json:"end"`
	Description       string    `json:"description"`
	ResponsiblePerson User      `json:"responsible_person"`
	NumberOfComments  int       `json:"number_of_comments"`
}

func (a *Api) registerEventApi(router *gin.RouterGroup) {
	router.GET("", a.GetEvents)
	router.GET("/:id", a.GetEvent)
	router.GET("/:id/comments", a.GetEventComments)
}

func apiUser(storeUser eventstore.User) User {
	return User{
		Name:      storeUser.Name(),
		Email:     storeUser.Email(),
		AvatarUrl: storeUser.AvatarUrl(),
	}
}

func apiEvent(storeEvent eventstore.Event) Event {
	return Event{
		Id:                storeEvent.Id(),
		Type:              storeEvent.Type(),
		Title:             storeEvent.Name(),
		Start:             storeEvent.Start(),
		End:               storeEvent.End(),
		Description:       storeEvent.Text(),
		ResponsiblePerson: apiUser(storeEvent.ResponsiblePerson()),
		NumberOfComments:  storeEvent.NumberOfComments(),
	}
}

func (a *Api) GetEvents(c *gin.Context) {
	storeEvents, err := a.store.Events(eventstore.EventFilter{Limit: 10})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": err})
		return
	}
	apiEvents := make([]Event, len(storeEvents))
	for i, e := range storeEvents {
		apiEvents[i] = apiEvent(e)
	}
	c.JSON(http.StatusOK, gin.H{"storeEvents": apiEvents})
}

func (a *Api) GetEvent(c *gin.Context) {
	event, err := a.store.Event(c.Param("id"))
	if err != nil {
		a.log.Error(err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": err,
		})
		return
	}
	if event == nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "event not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"event": apiEvent(event)})
}

func (a *Api) GetEventComments(c *gin.Context) {
	eventId := c.Param("id")
	notes, err := a.store.EventComments(eventId)
	if err != nil {
		a.log.Error(err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": err,
		})
		return
	}
	comments := make([]EventComment, len(notes))
	for i, n := range notes {
		comments[i] = EventComment{
			Author: apiUser(n.Author()),
			Text:   n.Text(),
		}
	}
	c.JSON(http.StatusOK, gin.H{
		"event":    eventId,
		"comments": comments,
	})
}
