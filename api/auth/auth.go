package auth

import (
	"fmt"
	"github.com/fusakla/coordinator/api"
	"github.com/gorilla/mux"
	"github.com/gorilla/sessions"
	"github.com/markbates/goth/gothic"
	"github.com/sirupsen/logrus"
	"net/http"
)

const CallbackPath = "/callback/"

func New(logger *logrus.Entry, sessionStore sessions.Store) *Api {
	return &Api{log: logger, sessionStore: &api.SessionStore{Store: sessionStore}}
}

type Api struct {
	log          *logrus.Entry
	sessionStore *api.SessionStore
}

func (a *Api) Register(router *mux.Router) {
	router.Path("/login").HandlerFunc(a.Login)
	router.Path(CallbackPath).HandlerFunc(a.LoginCallback)
	router.Path("/logout").HandlerFunc(a.Logout)
	router.Methods("GET").Path("/user").HandlerFunc(a.User)
}

func (a *Api) Login(w http.ResponseWriter, r *http.Request) {
	if user, err := gothic.CompleteUserAuth(w, r); err == nil {
		a.sessionStore.SetStorageToken(r, w, user.AccessToken)
		http.Redirect(w, r, "/", http.StatusTemporaryRedirect)
	} else {
		gothic.BeginAuthHandler(w, r)
	}
}

func (a *Api) LoginCallback(w http.ResponseWriter, r *http.Request) {
	user, err := gothic.CompleteUserAuth(w, r)
	if err != nil {
		api.TextResponse(w, http.StatusInternalServerError, fmt.Sprintf("Failed to authenticate: %s", err))
		return
	}
	a.sessionStore.SetStorageToken(r, w, user.AccessToken)
	a.sessionStore.SetUserInfo(r, w, user)
	http.Redirect(w, r, r.URL.Path, http.StatusTemporaryRedirect)
}

func (a *Api) Logout(w http.ResponseWriter, r *http.Request) {
	if err := gothic.Logout(w, r); err != nil {
		api.TextResponse(w, http.StatusInternalServerError, fmt.Sprintf("Failed to logout: %s", err))
		return
	}
	http.Redirect(w, r, "/", http.StatusTemporaryRedirect)
}

func (a *Api) User(w http.ResponseWriter, r *http.Request) {
	u, err := a.sessionStore.GetUserInfo(r)
	if err != nil {
		api.JSONResponse(w, http.StatusUnauthorized, fmt.Sprintf("You are not logged in"))
		return
	}
	api.JSONResponse(w, http.StatusOK, struct {
		Id        string `json:"id"`
		AvatarURL string `json:"avatar_url"`
		Name      string `json:"name"`
		Nickname  string `json:"nickname"`
		Email     string `json:"email"`
	}{
		Id:        u.UserID,
		AvatarURL: u.AvatarURL,
		Name:      u.Name,
		Nickname:  u.NickName,
		Email:     u.Email,
	})
}
