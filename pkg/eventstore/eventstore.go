package eventstore

import "time"

type User interface {
	Name() string
	Email() string
	AvatarUrl() string
}

type EventFilter struct {
	Limit int
}

type EventComment interface {
	Id() string
	Author() User
	Text() string
	CreatedAt() time.Time
}

type Event interface {
	Id() string
	Type() string
	Name() string
	Status() string
	Text() string
	Labels() []string
	ResponsiblePerson() User
	Start() time.Time
	End() time.Time
	NumberOfComments() int
}

type EventStore interface {
	Events(filter EventFilter) ([]Event, error)
	Event(id string) (Event, error)
	EventComments(id string) ([]EventComment, error)
}
