package storage

import (
	"context"
	"fmt"
	"github.com/fusakla/coordinator/pkg/config"
	"github.com/markbates/goth"
	"github.com/markbates/goth/gothic"
	gitlabAuth "github.com/markbates/goth/providers/gitlab"
	"github.com/xanzy/go-gitlab"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"
)

const (
	gitlabIncidentLabel    = "incident"
	gitlabMaintenanceLabel = "maintenance"
	gitlabWarningLabel     = "warning"

	gitlabOpenedIssueState = "opened"
	gitlabClosedIssueState = "closed"
)

func setupGitlabOauth(gitlabUrl, appKey, secretKey, callbackUrl string) {
	providerName := "gitlab"
	if gitlabUrl != "" {
		gitlabAuth.AuthURL = strings.Replace(gitlabAuth.AuthURL, "https:/gitlab.com", gitlabUrl, 1)
		gitlabAuth.TokenURL = strings.Replace(gitlabAuth.TokenURL, "https:/gitlab.com", gitlabUrl, 1)
		gitlabAuth.ProfileURL = strings.Replace(gitlabAuth.ProfileURL, "https:/gitlab.com", gitlabUrl, 1)
	}
	gothic.GetProviderName = func(_ *http.Request) (string, error) {
		return providerName, nil
	}
	p := gitlabAuth.New(
		appKey,
		secretKey,
		callbackUrl,
		"api",
	)
	p.SetName(providerName)
	goth.UseProviders(p)
}

func loadSecrets() {

}

func newGitlabStore(oAuthCallbackURL string, conf config.GitLabConfig) (Storage, error) {
	apiToken := os.Getenv("GITLAB_API_TOKEN")
	if apiToken == "" {
		return nil, fmt.Errorf("missing GitLab API token, set the GITLAB_API_TOKEN env variable")
	}
	var (
		client *gitlab.Client
		err    error
	)
	if conf.BaseURL != "" {
		client, err = gitlab.NewClient(apiToken, gitlab.WithBaseURL(conf.BaseURL))
	} else {
		client, err = gitlab.NewClient(apiToken)
	}
	if err != nil {
		return nil, fmt.Errorf("failed to initiate the GitLab client: %w", err)
	}
	project, _, err := client.Projects.GetProject(conf.Project, &gitlab.GetProjectOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to find specified project in GitLab: %w", err)
	}

	oAuthKey := os.Getenv("GITLAB_OAUTH_KEY")
	oAuthSecret := os.Getenv("GITLAB_OAUTH_SECRET")

	// Setup OAuth if configured
	oAuthEnabled := false
	if oAuthKey != "" && oAuthSecret != "" && oAuthCallbackURL != "" {
		setupGitlabOauth(conf.BaseURL, oAuthKey, oAuthSecret, oAuthCallbackURL)
		oAuthEnabled = false
	}
	return &gitlabStore{
		oAuthEnabled: oAuthEnabled,
		client:       client,
		baseUrl:      conf.BaseURL,
		project:      project,
	}, nil
}

type gitlabStore struct {
	oAuthEnabled bool
	client       *gitlab.Client
	baseUrl      string
	project      *gitlab.Project
}

func (g *gitlabStore) String() string {
	res := fmt.Sprintf("GitLab event storage adapter for project %s", g.project.WebURL)
	if g.oAuthEnabled {
		res += " with enabled oAuth"
	}
	return res
}

func (g *gitlabStore) oauthClient(token string) *gitlab.Client {
	c, _ := gitlab.NewOAuthClient(token, gitlab.WithBaseURL(g.baseUrl))
	return c
}

type gitlabEvent struct {
	issue *gitlab.Issue
}

func (g *gitlabEvent) Id() string {
	return strconv.Itoa(g.issue.IID)
}

func (g *gitlabEvent) Type() EventType {
	for _, l := range g.Labels() {
		switch l {
		case gitlabIncidentLabel:
			return IncidentEventType
		case gitlabMaintenanceLabel:
			return MaintenanceEventType
		case gitlabWarningLabel:
			return WarningEventType
		}
	}
	return UnknownEventType
}

func (g *gitlabEvent) Title() string {
	return g.issue.Title
}

func (g *gitlabEvent) State() EventState {
	switch g.issue.State {
	case gitlabOpenedIssueState:
		return ActiveEventState
	case gitlabClosedIssueState:
		return FinishedEventState
	default:
		return UnknownEventState
	}
}

func (g *gitlabEvent) Description() string {
	return g.issue.Description
}

func (g *gitlabEvent) Labels() []string {
	return g.issue.Labels
}

func (g *gitlabEvent) ResponsiblePerson() User {
	if g.issue.Assignee != nil {
		return &gitlabUser{
			name:   g.issue.Assignee.Username,
			email:  "",
			avatar: g.issue.Assignee.AvatarURL,
		}
	}
	if g.issue.Author != nil {
		return &gitlabUser{
			name:   g.issue.Author.Username,
			email:  "",
			avatar: g.issue.Author.AvatarURL,
		}
	}
	return &gitlabUser{}
}

func (g *gitlabEvent) Start() time.Time {
	if g.issue.CreatedAt != nil {
		return *g.issue.CreatedAt
	}
	return time.Now()
}

func (g *gitlabEvent) End() time.Time {
	if g.issue.ClosedAt != nil {
		return *g.issue.ClosedAt
	}
	if g.issue.DueDate != nil {
		return time.Time(*g.issue.DueDate)
	}
	return time.Now()
}

func (g *gitlabEvent) NumberOfComments() int {
	return g.issue.UserNotesCount
}

type gitlabEventComment struct {
	author User
	text   string
}

func (g *gitlabEventComment) Id() string {
	return g.Id()
}

func (g *gitlabEventComment) CreatedAt() time.Time {
	return g.CreatedAt()
}

func (g *gitlabEventComment) Author() User {
	return g.author
}

func (g *gitlabEventComment) Text() string {
	return g.text
}

type gitlabUser struct {
	name   string
	email  string
	avatar string
}

func (g *gitlabUser) Name() string {
	return g.name
}

func (g *gitlabUser) Email() string {
	return g.email
}

func (g *gitlabUser) AvatarUrl() string {
	return g.avatar
}

func labelsMatchFilter(labels gitlab.Labels, allowedEvents []EventType) bool {
	if allowedEvents == nil || len(allowedEvents) == 0 {
		return true
	}
	for _, l := range labels {
		for _, t := range allowedEvents {
			if l == string(t) {
				return true
			}
		}
	}
	return false
}

func (g *gitlabStore) Events(ctx context.Context, filter EventFilter) ([]Event, error) {
	issues, _, err := g.client.Issues.ListProjectIssues(g.project.ID, &gitlab.ListProjectIssuesOptions{
		ListOptions: gitlab.ListOptions{
			Page:    0,
			PerPage: filter.Limit,
		},
		OrderBy:       gitlab.String("created_at"),
		Sort:          gitlab.String("desc"),
		CreatedAfter:  &filter.Since,
		CreatedBefore: &filter.Until,
	}, gitlab.WithContext(ctx))
	if err != nil {
		return nil, fmt.Errorf("failed to fetch project issues: %v", err)
	}
	var events []Event
	for _, issue := range issues {
		if !labelsMatchFilter(issue.Labels, filter.EventTypes) {
			continue
		}
		events = append(events, &gitlabEvent{issue})
	}
	return events, nil
}

func (g *gitlabStore) Event(ctx context.Context, id string) (Event, error) {
	issueId, err := strconv.Atoi(id)
	if err != nil {
		return nil, err
	}
	issue, resp, err := g.client.Issues.GetIssue(g.project.ID, issueId, gitlab.WithContext(ctx))
	if err != nil {
		if resp != nil && resp.StatusCode == 404 {
			return nil, nil
		}
		return nil, err
	}
	return &gitlabEvent{issue}, nil
}

func (g *gitlabStore) NewEvent(ctx context.Context, token string, eventOpts NewEventOpts) error {
	var labels []string
	switch eventOpts.Type {
	case IncidentEventType:
		labels = []string{gitlabIncidentLabel}
	case MaintenanceEventType:
		labels = []string{gitlabMaintenanceLabel}
	case WarningEventType:
		labels = []string{gitlabWarningLabel}
	}
	_, _, err := g.oauthClient(token).Issues.CreateIssue(g.project.ID, &gitlab.CreateIssueOptions{
		Title:       gitlab.String(eventOpts.Title),
		Description: gitlab.String(eventOpts.Description),
		Labels:      labels,
	}, gitlab.WithContext(ctx))
	if err != nil {
		return err
	}
	return nil
}

func (g *gitlabStore) EventComments(ctx context.Context, id string) ([]EventComment, error) {
	issueId, err := strconv.Atoi(id)
	if err != nil {
		return nil, err
	}
	notes, _, err := g.client.Notes.ListIssueNotes(g.project.ID, issueId, &gitlab.ListIssueNotesOptions{
		ListOptions: gitlab.ListOptions{
			Page:    0,
			PerPage: 10,
		},
		OrderBy: gitlab.String("created_at"),
		Sort:    gitlab.String("desc"),
	}, gitlab.WithContext(ctx))
	if err != nil {
		return nil, err
	}
	var comments []EventComment
	for _, n := range notes {
		// If note created by system (automated) skip it to avoid noise.
		if n.System {
			continue
		}
		comments = append(comments, &gitlabEventComment{
			author: &gitlabUser{
				name:   n.Author.Username,
				email:  n.Author.Email,
				avatar: n.Author.AvatarURL,
			},
			text: n.Body,
		})
	}
	return comments, nil
}

func (g *gitlabStore) NewEventComment(ctx context.Context, token string, eventId string, commentOpts NewEventCommentOpts) error {
	id, err := strconv.Atoi(eventId)
	if err != nil {
		return err
	}
	_, _, err = g.oauthClient(token).Notes.CreateIssueNote(g.project.ID, id, &gitlab.CreateIssueNoteOptions{
		Body: gitlab.String(commentOpts.Text),
	}, gitlab.WithContext(ctx))
	if err != nil {
		return err
	}
	return nil
}
