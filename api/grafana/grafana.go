package grafana

import (
	"encoding/json"
	"fmt"
	"github.com/fusakla/coordinator/api"
	"github.com/fusakla/coordinator/pkg/storage"
	"github.com/gorilla/mux"
	"github.com/sirupsen/logrus"
	"net/http"
	"strings"
	"time"
)

type Annotation struct {
	Text      string   `json:"text"`
	Title     string   `json:"title"`
	IsRegion  bool     `json:"isRegion"`
	Time      int64    `json:"time"`
	TimeEnd   int64    `json:"timeEnd"`
	Tags      []string `json:"tags"`
	Login     string   `json:"login"`
	Email     string   `json:"email"`
	AvatarUrl string   `json:"avatarUrl"`
}

func New(logger *logrus.Entry, storage storage.Storage) *Api {
	return &Api{log: logger, storage: storage}
}

type Api struct {
	log     *logrus.Entry
	storage storage.Storage
}

func (a *Api) Register(router *mux.Router) {
	router.Path("/").Methods(http.MethodGet).HandlerFunc(a.Get)
	router.Path("/annotations").Methods(http.MethodOptions, http.MethodPost).HandlerFunc(a.PostAnnotations)
}

func (a *Api) Get(w http.ResponseWriter, r *http.Request) {
	api.TextResponse(w, http.StatusOK, "OK")
}

func parseAnnotationQuery(query string) (types []storage.EventType) {
	for _, v := range strings.Split(query, ",") {
		val := strings.TrimSpace(v)
		for _, s := range storage.EventTypes {
			if val == string(s) {
				types = append(types, s)
			}
		}
	}
	if len(types) == 0 {
		types = storage.EventTypes
	}
	return
}

func (a *Api) PostAnnotations(w http.ResponseWriter, r *http.Request) {
	var filter struct {
		Range struct {
			From time.Time `json:"from"`
			To   time.Time `json:"to"`
		} `json:"range"`
		Annotation struct {
			Query string `json:"query"`
		} `json:"annotation"`
	}
	if err := json.NewDecoder(r.Body).Decode(&filter); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	events, err := a.storage.Events(r.Context(), storage.EventFilter{
		Limit:      100,
		Since:      filter.Range.From,
		Until:      filter.Range.To,
		EventTypes: parseAnnotationQuery(filter.Annotation.Query),
	})
	if err != nil {
		api.TextResponse(w, http.StatusInternalServerError, fmt.Sprintf("Failed to get annotations: %v", err))
		return
	}
	var annotations []Annotation
	for _, e := range events {
		annotations = append(annotations, Annotation{
			Text:      e.Description(),
			Title:     e.Title(),
			IsRegion:  false,
			Time:      e.Start().UnixNano() / int64(time.Millisecond),
			TimeEnd:   e.End().UnixNano() / int64(time.Millisecond),
			Tags:      append(e.Labels(), string(e.Type())),
			Login:     e.ResponsiblePerson().Name(),
			Email:     e.ResponsiblePerson().Email(),
			AvatarUrl: e.ResponsiblePerson().AvatarUrl(),
		})
	}
	api.JSONResponse(w, http.StatusOK, annotations)
}
