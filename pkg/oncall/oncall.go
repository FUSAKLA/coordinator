package oncall

import (
	"context"
	"fmt"
	"github.com/fusakla/coordinator/pkg/config"
	"os"
)

type Person struct {
	Name  string
	Email string
	Phone string
}

type Manager interface {
	fmt.Stringer
	WhoIsOnCall(ctx context.Context, vendor string, scheduleName string) ([]Person, error)
}

type Provider interface {
	WhoIsOnCall(ctx context.Context, scheduleName string) ([]Person, error)
}

func New(config config.OnCallVendorConfig) (Manager, error) {
	m := manager{providers: map[string]Provider{}}

	// Setup OpsGenie provider
	opsgenieToken := os.Getenv("OPSGENIE_API_TOKEN")
	if opsgenieToken != "" {
		opsgenieProvider, err := NewOpsGenie(opsgenieToken, config.OpsGenie)
		if err != nil {
			return nil, fmt.Errorf("OpsGenie provider: %w", err)
		}
		m.providers["opsgenie"] = opsgenieProvider
	}

	// Setup PagerDuty provider
	pagerdutyToken := os.Getenv("PAGERDUTY_API_TOKEN")
	if pagerdutyToken != "" {
		pagerdutyProvider, err := NewPagerDuty(pagerdutyToken)
		if err != nil {
			return nil, fmt.Errorf("PagerDuty provider: %w", err)
		}
		m.providers["pagerduty"] = pagerdutyProvider
	}

	return &m, nil

}

type manager struct {
	providers map[string]Provider
}

func (m *manager) String() string {
	return fmt.Sprintf("On call provider supporting vendors: %s", m.supportedVendors())
}

func (m *manager) supportedVendors() []string {
	var vendors []string
	for k, _ := range m.providers {
		vendors = append(vendors, k)
	}
	return vendors
}

func (m *manager) WhoIsOnCall(ctx context.Context, vendor string, scheduleName string) ([]Person, error) {
	vendorProvider, ok := m.providers[vendor]
	if !ok {
		return nil, fmt.Errorf("invalid vendor `%s`, supported vendors are: %s", vendor, m.supportedVendors())
	}
	return vendorProvider.WhoIsOnCall(ctx, scheduleName)
}
