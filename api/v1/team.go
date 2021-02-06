package v1

import (
	"fmt"
	"github.com/fusakla/coordinator/api"
	"github.com/fusakla/coordinator/pkg/catalogue"
	"github.com/fusakla/coordinator/pkg/oncall"
	"github.com/gorilla/mux"
	"net/http"
)

type OnCall struct {
	Vendor       string `json:"vendor"`
	ScheduleName string `json:"schedule_name"`
}

type Team struct {
	Id               string   `json:"id"`
	Name             string   `json:"name"`
	Email            string   `json:"email"`
	IMChannelURL     string   `json:"im_channel_url"`
	DashboardURL     string   `json:"dashboard_url"`
	DocumentationURL string   `json:"documentation_url"`
	Services         []string `json:"managed_services"`
	OnCall           OnCall   `json:"on_call"`
}

type Person struct {
	Name  string `json:"name"`
	Email string `json:"email"`
	Phone string `json:"phone"`
}

func (a *Api) registerTeamsApi(router *mux.Router) {
	router.Methods("GET").Path("").HandlerFunc(a.GetTeams)
	router.Methods("GET").Path("/{id}").HandlerFunc(a.GetTeam)
	router.Methods("GET").Path("/{id}/oncall").HandlerFunc(a.GetTeamOnCall)
}

func apiTeam(team catalogue.Team) Team {
	return Team{
		Id:               team.Id,
		Name:             team.Name,
		Email:            team.Email,
		IMChannelURL:     team.IMChannelURL,
		DashboardURL:     team.DashboardURL,
		DocumentationURL: team.DocumentationURL,
		Services:         team.Services,
		OnCall: OnCall{
			Vendor:       team.OnCall.Vendor,
			ScheduleName: team.OnCall.ScheduleName,
		},
	}
}

func apiPerson(person oncall.Person) Person {
	return Person{
		Name:  person.Name,
		Email: person.Email,
		Phone: person.Phone,
	}
}

func (a *Api) GetTeams(w http.ResponseWriter, r *http.Request) {
	teams := a.catalogue.Teams()
	var apiTeams = make([]Team, len(teams))
	for i, t := range teams {
		apiTeams[i] = apiTeam(t)
	}
	api.JSONResponse(w, http.StatusOK, struct {
		Teams []Team `json:"teams"`
	}{Teams: apiTeams})
}

func (a *Api) GetTeam(w http.ResponseWriter, r *http.Request) {
	team, ok := a.catalogue.Team(mux.Vars(r)["id"])
	if !ok {
		api.JSONErrorResponse(w, http.StatusNotFound, "team not found")
		return
	}
	api.JSONResponse(w, http.StatusOK, apiTeam(team))
}

func (a *Api) GetTeamOnCall(w http.ResponseWriter, r *http.Request) {
	team, ok := a.catalogue.Team(mux.Vars(r)["id"])
	if !ok {
		api.JSONErrorResponse(w, http.StatusNotFound, "team not found")
		return
	}
	users, err := a.onCall.WhoIsOnCall(r.Context(), team.OnCall.Vendor, team.OnCall.ScheduleName)
	if err != nil {
		api.JSONErrorResponse(w, http.StatusInternalServerError, fmt.Sprintf("error getting team on-call person: %v", err))
		return
	}
	onCall := make([]Person, len(users))
	for i, u := range users {
		onCall[i] = apiPerson(u)
	}
	api.JSONResponse(w, http.StatusOK, onCall)
}
