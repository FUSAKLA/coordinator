package main

import (
	"context"
	"github.com/albertogviana/prometheus-middleware"
	"github.com/fusakla/coordinator/api/auth"
	"github.com/fusakla/coordinator/api/calendar"
	v1 "github.com/fusakla/coordinator/api/v1"
	"github.com/fusakla/coordinator/pkg/catalogue"
	"github.com/fusakla/coordinator/pkg/config"
	"github.com/fusakla/coordinator/pkg/oncall"
	"github.com/fusakla/coordinator/pkg/statikhandler"
	"github.com/fusakla/coordinator/pkg/storage"
	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	"github.com/gorilla/sessions"
	"github.com/markbates/goth/gothic"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"github.com/rs/cors"
	log "github.com/sirupsen/logrus"
	"gopkg.in/alecthomas/kingpin.v2"
	"net/http"
	"os"
	"path"
	"time"
)

var (
	configFile = kingpin.Flag("config-file", "Path to configuration file.").Required().ExistingFile()
)

func main() {
	kingpin.Parse()
	logger := log.New()

	// Load the configuration file.
	conf, err := config.NewFromFile(*configFile)
	if err != nil {
		logger.Fatalf("error loading config file: %v", err)
	}

	r := mux.NewRouter()
	var sessionStore = sessions.NewCookieStore([]byte(os.Getenv("SESSION_KEY")))

	// If user has set the oAuth callback setup the authentication API.
	if conf.Storage.OAuthCallbackBaseURL != "" {
		gothic.Store = sessionStore
		authPath := "/auth"
		authApi := auth.New(log.WithField("api", "auth"), sessionStore)
		authApi.Register(r.PathPrefix(authPath).Subrouter())
		conf.Storage.OAuthCallbackBaseURL = conf.Storage.OAuthCallbackBaseURL + path.Join(authPath, auth.CallbackPath)
	}

	// Initialize the catalogue of teams.
	teamCatalogue := catalogue.New()
	if conf.Catalogue.Enabled {
		go func() {
			if err := teamCatalogue.SyncWithFile(context.Background(), logger.WithField("job", "catalogue-sync"), conf.Catalogue.FilePath, 10*time.Second); err != nil {
				log.Fatal(err)
			}
		}()
	}
	log.Infof("Initialized %s", teamCatalogue)

	// Initialize the onCall manager
	onCall, err := oncall.New(conf.OnCall)
	if err != nil {
		log.Fatalf("error initializing on-call manager: %v", err)
	}
	log.Infof("Initialized %s", onCall)

	// Initialize the main event storage.
	store, err := storage.New(conf.Storage)
	if err != nil {
		log.Fatalf("error initializing storage: %v", err)
	}
	log.Infof("Initialized %s", store)

	r.Path("/metrics").Handler(promhttp.Handler())

	// Setup the API.
	apiV1 := v1.New(log.WithField("api", "v1"), sessionStore, store, teamCatalogue, onCall)
	apiV1.Register(r.PathPrefix("/api/v1").Subrouter())

	calendarApi := calendar.New(log.WithField("api", "calendar"), store)
	calendarApi.Register(r.PathPrefix("/api/calendar").Subrouter())

	staticFileHandler, err := statikhandler.New("/index.html")
	if err != nil {
		log.Fatalf("error initializing static file handler: %v", err)
	}
	r.PathPrefix("/").Handler(staticFileHandler)
	log.Infof("Initialized static files handler")

	middleware := prometheusmiddleware.NewPrometheusMiddleware(prometheusmiddleware.Opts{})
	r.Use(middleware.InstrumentHandlerDuration)

	// Spin up the server.
	log.Infof("Starting server, listening on: http://0.0.0.0:8080")
	handler := cors.Default().Handler(r)
	log.Fatal(http.ListenAndServe(":8080", handlers.LoggingHandler(os.Stdout, handler)))
}
