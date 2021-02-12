package oncall

import (
	"context"
	"fmt"
	"github.com/fusakla/coordinator/pkg/config"
	"github.com/opsgenie/opsgenie-go-sdk-v2/client"
	"github.com/opsgenie/opsgenie-go-sdk-v2/schedule"
	"github.com/opsgenie/opsgenie-go-sdk-v2/user"
	"github.com/sirupsen/logrus"
)

func NewOpsGenie(token string, conf config.OpsGenieConfig) (Provider, error) {
	lvl, err := logrus.ParseLevel(conf.LogLevel)
	if err != nil {
		return nil, fmt.Errorf("invalid OpsGenie log level: %s", err)
	}
	scheduleCli, err := schedule.NewClient(&client.Config{
		OpsGenieAPIURL: client.ApiUrl(conf.ApiURL),
		ApiKey:         token,
		RequestTimeout: conf.RequestTimeout,
		RetryCount:     conf.MaxRetries,
		LogLevel:       lvl,
	})
	if err != nil {
		return nil, fmt.Errorf("invalid OpsGenie schedule client: %s", err)
	}
	userCli, err := user.NewClient(&client.Config{
		OpsGenieAPIURL: client.ApiUrl(conf.ApiURL),
		ApiKey:         token,
		RequestTimeout: conf.RequestTimeout,
		RetryCount:     conf.MaxRetries,
		LogLevel:       lvl,
	})
	if err != nil {
		return nil, fmt.Errorf("invalid OpsGenie user client: %s", err)
	}
	return &opsGenie{scheduleClient: scheduleCli, userClient: userCli}, nil
}

type opsGenie struct {
	scheduleClient *schedule.Client
	userClient     *user.Client
}

func (p *opsGenie) person(ctx context.Context, username string) (Person, error) {
	u, err := p.userClient.Get(ctx, &user.GetRequest{
		Identifier: username,
		Expand:     "contact",
	})
	if err != nil {
		return Person{}, err
	}
	person := Person{Name: u.FullName}
	for _, c := range u.UserContacts {
		switch c.ContactMethod {
		case "email":
			person.Email = c.To
		case "voice":
			person.Phone = "+" + c.To
		}
		if person.Phone != "" && person.Email != "" {
			break
		}
	}
	return person, nil
}

func (p *opsGenie) WhoIsOnCall(ctx context.Context, scheduleName string) ([]Person, error) {
	flat := true
	resp, err := p.scheduleClient.GetOnCalls(ctx, &schedule.GetOnCallsRequest{
		BaseRequest:            client.BaseRequest{},
		Flat:                   &flat,
		ScheduleIdentifierType: schedule.Name,
		ScheduleIdentifier:     scheduleName,
	})
	if err != nil {
		return nil, err
	}
	var users []Person
	for _, r := range resp.OnCallRecipients {
		u, err := p.person(ctx, r)
		if err != nil {
			return nil, err
		}
		users = append(users, u)
	}
	return users, nil
}
