package v1

import (
	"context"
	"fmt"
	"github.com/fusakla/coordinator/api"
	"github.com/fusakla/coordinator/pkg/catalogue"
	"github.com/fusakla/coordinator/pkg/oncall"
	"github.com/gorilla/mux"
	"net/http"
)

type Service struct {
	Name             string `json:"name"`
	Description      string `json:"description"`
	Url              string `json:"url"`
	DashboardUrl     string `json:"dashboard_url"`
	DocumentationUrl string `json:"documentation_url"`
	SourceCodeUrl    string `json:"source_code_url"`
	ImChannelUrl     string `json:"im_channel_url"`
}

type OnCall struct {
	Vendor       string   `json:"vendor"`
	ScheduleName string   `json:"schedule_name"`
	Person       []Person `json:"person"`
}

type Team struct {
	Id               string    `json:"id"`
	Name             string    `json:"name"`
	Email            string    `json:"email"`
	IMChannelURL     string    `json:"im_channel_url"`
	DashboardURL     string    `json:"dashboard_url"`
	DocumentationURL string    `json:"documentation_url"`
	Services         []Service `json:"managed_services"`
	OnCall           OnCall    `json:"on_call"`
}

type Person struct {
	Name  string `json:"name"`
	Email string `json:"email"`
	Phone string `json:"phone"`
}

func (a *Api) registerTeamsApi(router *mux.Router) {
	router.Methods("GET").Path("").HandlerFunc(a.GetTeams)
	router.Methods("GET").Path("/{id}").HandlerFunc(a.GetTeam)
}

func (a *Api) apiTeam(ctx context.Context, team catalogue.Team) (Team, error) {
	onCall, err := a.getTeamOnCall(ctx, team.Id)
	if err != nil {
		return Team{}, err
	}
	t := Team{
		Id:               team.Id,
		Name:             team.Name,
		Email:            team.Email,
		IMChannelURL:     team.IMChannelURL,
		DashboardURL:     team.DashboardURL,
		DocumentationURL: team.DocumentationURL,
		Services:         []Service{},
		OnCall: OnCall{
			Vendor:       team.OnCall.Vendor,
			ScheduleName: team.OnCall.ScheduleName,
			Person:       onCall,
		},
	}
	for _, s := range team.Services {
		t.Services = append(t.Services, apiService(s))
	}
	return t, nil
}

func apiPerson(person oncall.Person) Person {
	return Person{
		Name:  person.Name,
		Email: person.Email,
		Phone: person.Phone,
	}
}

func apiService(svc catalogue.Service) Service {
	return Service{
		Name:             svc.Name,
		Description:      svc.Description,
		Url:              svc.Url,
		DashboardUrl:     svc.DashboardUrl,
		DocumentationUrl: svc.DocumentationUrl,
		SourceCodeUrl:    svc.SourceCodeUrl,
		ImChannelUrl:     svc.ImChannelUrl,
	}
}

func (a *Api) GetTeams(w http.ResponseWriter, r *http.Request) {
	teams := a.catalogue.Teams()
	var apiTeams = make([]Team, len(teams))
	var err error
	for i, t := range teams {
		apiTeams[i], err = a.apiTeam(r.Context(), t)
		if err != nil {
			api.JSONErrorResponse(w, http.StatusInternalServerError, fmt.Sprintf("error getting team oncall: %v", err))
			return
		}
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
	t, err := a.apiTeam(r.Context(), team)
	if err != nil {
		api.JSONErrorResponse(w, http.StatusInternalServerError, fmt.Sprintf("error getting team oncall: %v", err))
		return
	}
	api.JSONResponse(w, http.StatusOK, t)
}

func (a *Api) getTeamOnCall(ctx context.Context, id string) ([]Person, error) {
	team, ok := a.catalogue.Team(id)
	if !ok {
		return nil, fmt.Errorf("team not found")
	}
	users, err := a.onCall.WhoIsOnCall(ctx, team.OnCall.Vendor, team.OnCall.ScheduleName)
	if err != nil {
		return nil, fmt.Errorf("error getting team on-call person: %v", err)
	}
	onCall := make([]Person, len(users))
	for i, u := range users {
		onCall[i] = apiPerson(u)
	}
	return onCall, nil
}
