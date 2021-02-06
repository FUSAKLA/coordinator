package v1

import (
	"encoding/json"
	"fmt"
	"github.com/fusakla/coordinator/api"
	"github.com/fusakla/coordinator/pkg/storage"
	"github.com/go-playground/form/v4"
	"github.com/go-playground/validator/v10"
	"github.com/gorilla/mux"
	"net/http"
	"time"
)

type User struct {
	Name      string `json:"name"`
	Email     string `json:"email"`
	AvatarUrl string `json:"avatar_url"`
}

type EventComment struct {
	Author User   `json:"author" validate:"-"`
	Text   string `json:"text" validate:"required"`
}

type Event struct {
	Id                string    `json:"id" validate:"isdefault"`
	State             string    `json:"state" validate:"isdefault"`
	Type              string    `json:"type"  validate:"required"`
	Title             string    `json:"title" validate:"required"`
	Start             time.Time `json:"start"`
	End               time.Time `json:"end"`
	Description       string    `json:"description"`
	Labels            []string  `json:"labels"`
	ResponsiblePerson User      `json:"responsible_person" validate:"-"`
	NumberOfComments  int       `json:"number_of_comments" validate:"isdefault"`
}

func (a *Api) registerEventApi(router *mux.Router) {
	router.Methods("GET").Path("").HandlerFunc(a.GetEvents)
	router.Methods("POST").Path("").HandlerFunc(a.PostEvent)
	router.Methods("GET").Path("/{id}").HandlerFunc(a.GetEvent)
	router.Methods("GET").Path("/{id}/comments").HandlerFunc(a.GetEventComments)
	router.Methods("POST").Path("/{id}/comments").HandlerFunc(a.PostEventComment)
}

func apiUser(storeUser storage.User) User {
	return User{
		Name:      storeUser.Name(),
		Email:     storeUser.Email(),
		AvatarUrl: storeUser.AvatarUrl(),
	}
}

func apiEvent(storeEvent storage.Event) Event {
	return Event{
		Id:                storeEvent.Id(),
		State:             string(storeEvent.State()),
		Type:              string(storeEvent.Type()),
		Title:             storeEvent.Title(),
		Start:             storeEvent.Start(),
		End:               storeEvent.End(),
		Description:       storeEvent.Description(),
		Labels:            storeEvent.Labels(),
		ResponsiblePerson: apiUser(storeEvent.ResponsiblePerson()),
		NumberOfComments:  storeEvent.NumberOfComments(),
	}
}

func stringsToEventTypes(strings []string) ([]storage.EventType, error) {
	t := make([]storage.EventType, len(strings))
	for i, s := range strings {
		if err := api.ValidateEventType(s); err != nil {
			return nil, err
		}
		t[i] = storage.EventType(s)
	}
	return t, nil
}

func (a *Api) GetEvents(w http.ResponseWriter, r *http.Request) {
	var f struct {
		Limit     int       `form:"limit,omitempty"`
		Since     time.Time `form:"since,omitempty"`
		Until     time.Time `form:"until,omitempty"`
		EventType []string  `form:"event_type,omitempty"`
	}
	if err := form.NewDecoder().Decode(&f, r.URL.Query()); err != nil {
		api.JSONErrorResponse(w, http.StatusBadRequest, fmt.Sprintf("Invalid query: %v", err))
		return
	}
	filter := storage.EventFilter{
		Limit:      30,
		Since:      time.Now().Add(-time.Hour * 24 * 7),
		Until:      time.Now(),
		EventTypes: nil,
	}
	typesFilter, err := stringsToEventTypes(f.EventType)
	if err != nil {
		api.JSONErrorResponse(w, http.StatusBadRequest, fmt.Sprintf("invalid event types: %v", err))
		return
	}
	if len(typesFilter) > 0 {
		filter.EventTypes = typesFilter
	}
	if f.Limit > 0 {
		filter.Limit = f.Limit
	}
	if f.Since.Nanosecond() > 0 {
		filter.Since = f.Since
	}
	if f.Until.Nanosecond() > 0 {
		filter.Until = f.Until
	}
	storeEvents, err := a.storage.Events(r.Context(), filter)
	if err != nil {
		api.JSONErrorResponse(w, http.StatusInternalServerError, fmt.Sprintf("error reading events from storage: %v", err))
		return
	}
	apiEvents := make([]Event, len(storeEvents))
	for i, e := range storeEvents {
		apiEvents[i] = apiEvent(e)
	}
	api.JSONResponse(w, http.StatusOK, struct {
		Events []Event `json:"events"`
	}{Events: apiEvents})
}

func (a *Api) GetEvent(w http.ResponseWriter, r *http.Request) {
	event, err := a.storage.Event(r.Context(), mux.Vars(r)["id"])
	if err != nil {
		api.JSONErrorResponse(w, http.StatusInternalServerError, fmt.Sprintf("failed to get event from storage: %v", err))
		return
	}
	if event == nil {
		api.JSONErrorResponse(w, http.StatusNotFound, "event not found")
		return
	}
	api.JSONResponse(w, http.StatusOK, struct {
		Event Event `json:"event"`
	}{Event: apiEvent(event)})
}

func (a *Api) PostEvent(w http.ResponseWriter, r *http.Request) {
	e := Event{}
	if err := json.NewDecoder(r.Body).Decode(&e); err != nil {
		api.JSONErrorResponse(w, http.StatusBadRequest, fmt.Sprintf("invalid event: %v", err))
		return
	}
	a.log.Info(e)
	if err := validator.New().Struct(e); err != nil {
		api.JSONErrorResponse(w, http.StatusBadRequest, fmt.Sprintf("invalid event: %v", err))
		return
	}
	t, err := a.sessionStore.GetStorageToken(r)
	if err != nil {
		http.Redirect(w, r, "/auth/login", http.StatusTemporaryRedirect)
		return
	}
	if err := a.storage.NewEvent(
		r.Context(),
		t,
		storage.NewEventOpts{
			Type:        storage.EventType(e.Type),
			Title:       e.Title,
			Description: e.Description,
			Labels:      e.Labels,
			Start:       e.Start,
			End:         e.End,
		}); err != nil {
		api.JSONErrorResponse(w, http.StatusInternalServerError, fmt.Sprintf("failed to create new event: %v", err))
		return
	}
	api.JSONResponse(w, http.StatusOK, struct {
		Message string `json:"message"`
	}{Message: "OK"})
}

func (a *Api) GetEventComments(w http.ResponseWriter, r *http.Request) {
	notes, err := a.storage.EventComments(r.Context(), mux.Vars(r)["id"])
	if err != nil {
		api.JSONErrorResponse(w, http.StatusInternalServerError, fmt.Sprintf("failed to get event comment: %v", err))
		return
	}
	comments := make([]EventComment, len(notes))
	for i, n := range notes {
		comments[i] = EventComment{
			Author: apiUser(n.Author()),
			Text:   n.Text(),
		}
	}
	api.JSONResponse(w, http.StatusOK, struct {
		Comments []EventComment `json:"comments"`
	}{Comments: comments})
}

func (a *Api) PostEventComment(w http.ResponseWriter, r *http.Request) {
	var e EventComment
	if err := json.NewDecoder(r.Body).Decode(&e); err != nil {
		api.JSONErrorResponse(w, http.StatusBadRequest, fmt.Sprintf("invalid event comment: %v", err))
		return
	}
	if err := validator.New().Struct(e); err != nil {
		api.JSONErrorResponse(w, http.StatusBadRequest, fmt.Sprintf("invalid event comment: %v", err))
		return
	}
	t, err := a.sessionStore.GetStorageToken(r)
	if err != nil {
		http.Redirect(w, r, "/auth/login", http.StatusTemporaryRedirect)
		return
	}
	if err := a.storage.NewEventComment(
		r.Context(),
		t,
		mux.Vars(r)["id"],
		storage.NewEventCommentOpts{Text: e.Text},
	); err != nil {
		api.JSONErrorResponse(w, http.StatusInternalServerError, fmt.Sprintf("failed to add comment to event: %v", err))
		return
	}
	api.JSONResponse(w, http.StatusOK, struct {
		Message string `json:"message"`
	}{Message: "OK"})
}
