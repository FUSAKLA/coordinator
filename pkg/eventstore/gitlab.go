package eventstore

import (
	"fmt"
	"github.com/xanzy/go-gitlab"
	"io/ioutil"
	"strconv"
	"strings"
	"time"
)

func newGitlabStore(opts Opts) (EventStore, error) {
	tokenBytes, err := ioutil.ReadFile(*opts.GitlabTokenFile)
	if err != nil {
		return nil, err
	}
	client, err := gitlab.NewClient(strings.TrimSpace(string(tokenBytes)), gitlab.WithBaseURL(*opts.GitlabUrl))
	if err != nil {
		return nil, fmt.Errorf("failed to initiate the GitLab client: %w", err)
	}
	project, _, err := client.Projects.GetProject(*opts.GitlabProject, &gitlab.GetProjectOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to find specified project in GitLab: %w", err)
	}
	return &gitlabStore{
		client:  client,
		project: project,
	}, nil
}

type gitlabStore struct {
	client  *gitlab.Client
	project *gitlab.Project
}

type gitlabEvent struct {
	*gitlab.Issue
}

func (g *gitlabEvent) Id() string {
	return strconv.Itoa(g.IID)
}

func (g *gitlabEvent) Type() string {
	return "Incident" // TODO
}

func (g *gitlabEvent) Name() string {
	return g.Title
}

func (g *gitlabEvent) Status() string {
	return g.State
}

func (g *gitlabEvent) Text() string {
	return g.Description
}

func (g *gitlabEvent) Labels() []string {
	return g.Labels()
}

func (g *gitlabEvent) ResponsiblePerson() User {
	if g.Assignee != nil {
		return &gitlabUser{
			name:   g.Assignee.Username,
			email:  "",
			avatar: g.Assignee.AvatarURL,
		}
	}
	if g.Author != nil {
		return &gitlabUser{
			name:   g.Author.Username,
			email:  "",
			avatar: g.Author.AvatarURL,
		}
	}
	return &gitlabUser{}
}

func (g *gitlabEvent) Start() time.Time {
	if g.CreatedAt != nil {
		return *g.CreatedAt
	}
	return time.Now()
}

func (g *gitlabEvent) End() time.Time {
	if g.ClosedAt != nil {
		return *g.ClosedAt
	}
	if g.DueDate != nil {
		return time.Time(*g.DueDate)
	}
	return time.Now()
}

func (g *gitlabEvent) NumberOfComments() int {
	return g.UserNotesCount
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

func (g *gitlabStore) Events(filter EventFilter) ([]Event, error) {
	issues, _, err := g.client.Issues.ListProjectIssues(g.project.ID, &gitlab.ListProjectIssuesOptions{
		ListOptions: gitlab.ListOptions{
			Page:    0,
			PerPage: filter.Limit,
		},
		OrderBy: gitlab.String("created_at"),
		Sort:    gitlab.String("desc"),
		Labels:  []string{"incident"},
	})
	if err != nil {
		return nil, fmt.Errorf("failed to fetch project issues: %v", err)
	}
	events := make([]Event, filter.Limit)
	for i, issue := range issues {
		events[i] = &gitlabEvent{issue}
	}
	return events, nil
}

func (g *gitlabStore) Event(id string) (Event, error) {
	issueId, err := strconv.Atoi(id)
	if err != nil {
		return nil, err
	}
	issue, resp, err := g.client.Issues.GetIssue(g.project.ID, issueId)
	if err != nil {
		if resp != nil && resp.StatusCode == 404 {
			return nil, nil
		}
		return nil, err
	}
	return &gitlabEvent{issue}, nil
}

func (g *gitlabStore) EventComments(id string) ([]EventComment, error) {
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
	})
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
