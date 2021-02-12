package storage

import (
	"context"
	"fmt"
	"time"
)

type EventType string

type EventState string

const (
	MaintenanceEventType EventType = "maintenance"
	IncidentEventType    EventType = "incident"
	NoticeEventType      EventType = "notice"
	UnknownEventType     EventType = "unknown"

	ActiveEventState   EventState = "active"
	FinishedEventState EventState = "finished"
	UnknownEventState  EventState = "unknown"
)

var (
	EventTypes  = []EventType{MaintenanceEventType, IncidentEventType, NoticeEventType}
	EventStates = []EventState{ActiveEventState, FinishedEventState}
)

type User interface {
	Name() string
	Email() string
	AvatarUrl() string
}

type EventFilter struct {
	Limit int
	Since time.Time
	Until time.Time
	EventTypes []EventType
}

type NewEventCommentOpts struct {
	Text string
}

type EventComment interface {
	Id() string
	Author() User
	Text() string
	CreatedAt() time.Time
}

type NewEventOpts struct {
	Type        EventType
	Title       string
	Description string
	Labels      []string
	Start       time.Time
	End         time.Time
}

type Event interface {
	Id() string
	Type() EventType
	State() EventState
	Service() string
	Title() string
	Description() string
	Labels() []string
	ResponsiblePerson() User
	Start() time.Time
	End() time.Time
	NumberOfComments() int
}

type Storage interface {
	fmt.Stringer
	NewEvent(ctx context.Context, token string, eventOpts NewEventOpts) error
	Events(ctx context.Context, filter EventFilter) ([]Event, error)
	Event(ctx context.Context, eventId string) (Event, error)

	NewEventComment(ctx context.Context, token string, eventId string, commentOpts NewEventCommentOpts) error
	EventComments(ctx context.Context, eventId string) ([]EventComment, error)
}
