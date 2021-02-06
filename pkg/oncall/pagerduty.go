package oncall

import (
	"context"
	"fmt"
	"github.com/PagerDuty/go-pagerduty"
)

func NewPagerDuty(token string) (Provider, error) {
	return &pagerDuty{client: pagerduty.NewClient(token)}, nil
}

type pagerDuty struct {
	client *pagerduty.Client
}

func (p pagerDuty) scheduleId(_ context.Context, scheduleName string) (string, error) {
	resp, err := p.client.ListSchedules(pagerduty.ListSchedulesOptions{})
	if err != nil {
		return "", err
	}
	for _, s := range resp.Schedules {
		if s.Name == scheduleName {
			return s.ID, nil
		}
	}
	return "", fmt.Errorf("PagerDuty schedule `%s` not found", scheduleName)
}

func (p *pagerDuty) WhoIsOnCall(ctx context.Context, scheduleName string) ([]Person, error) {
	scheduleId, err := p.scheduleId(ctx, scheduleName)
	if err != nil {
		return nil, err
	}
	onCallUsers, err := p.client.ListOnCallUsers(scheduleId, pagerduty.ListOnCallUsersOptions{})
	if err != nil {
		return nil, err
	}
	users := make([]Person, len(onCallUsers))
	for i, u := range onCallUsers {
		users[i] = Person{
			Name:  u.Name,
			Email: u.Email,
		}
		for _, c := range u.ContactMethods {
			if c.Type == "phone" {
				users[i].Phone = fmt.Sprintf("+%d %s", c.CountryCode, c.Address)
				break
			}
		}
	}
	return users, nil
}
