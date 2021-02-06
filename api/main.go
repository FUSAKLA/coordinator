package api

import (
	"encoding/json"
	"fmt"
	"github.com/fusakla/coordinator/pkg/storage"
	"github.com/gorilla/sessions"
	"github.com/markbates/goth"
	"net/http"
)

type SessionStore struct {
	sessions.Store
}

func (s *SessionStore) SetStorageToken(r *http.Request, w http.ResponseWriter, token string) {
	c, _ := s.Store.Get(r, "coordinator")
	c.Values["storage-token"] = token
	_ = c.Save(r, w)
}

func (s *SessionStore) GetStorageToken(r *http.Request) (string, error) {
	c, err := s.Store.Get(r, "coordinator")
	if err != nil {
		return "", err
	}
	token, ok := c.Values["storage-token"].(string)
	if !ok {
		return "", fmt.Errorf("invalid token storage OAuth token in session")
	}
	if token == "" {
		return "", fmt.Errorf("missing storage OAuth token in the session")
	}
	return token, nil
}

func (s *SessionStore) SetUserInfo(r *http.Request, w http.ResponseWriter, user goth.User) {
	c, _ := s.Store.Get(r, "coordinator")
	c.Values["user-info"] = user
	_ = c.Save(r, w)
}

func (s *SessionStore) GetUserInfo(r *http.Request) (*goth.User, error) {
	c, err := s.Store.Get(r, "coordinator")
	if err != nil {
		return nil, err
	}
	user, ok := c.Values["user-info"].(goth.User)
	if !ok {
		return nil, fmt.Errorf("invalid user info in session: %s", c.Values["user-info"])
	}
	return &user, nil
}

func ValidateEventType(value string) error {
	for _, s := range storage.EventTypes {
		if string(s) == value {
			return nil
		}
	}
	return fmt.Errorf("invalid event type '%s' must be one of: %s", value, storage.EventTypes)
}

func JSONResponse(w http.ResponseWriter, code int, payload interface{}) {
	response, _ := json.Marshal(payload)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	_, _ = w.Write(response)
}

func JSONErrorResponse(w http.ResponseWriter, code int, message string) {
	JSONResponse(w, code, struct{ Message string }{Message: message})
}

func TextResponse(w http.ResponseWriter, code int, text string) {
	w.WriteHeader(code)
	_, _ = w.Write([]byte(text))
}
