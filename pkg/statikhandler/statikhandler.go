package statikhandler

import (
	_ "github.com/fusakla/coordinator/statik"
	"github.com/rakyll/statik/fs"
	"io/ioutil"
	"mime"
	"net/http"
	"path/filepath"
	"strings"
)

func New(defaultFilePath string) (http.Handler, error) {
	statikFS, err := fs.New()
	if err != nil {
		return nil, err
	}
	return &statikHandler{
		files:       statikFS,
		defaultFile: defaultFilePath,
	}, nil
}

type statikHandler struct {
	files       http.FileSystem
	defaultFile string
}

func (h *statikHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	path, err := filepath.Abs(r.URL.Path)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	path = strings.TrimSuffix(path, "/")
	file, err := h.files.Open(path)
	if err != nil {
		path = h.defaultFile
		file, err = h.files.Open(path)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}
	defer file.Close()
	content, err := ioutil.ReadAll(file)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", mime.TypeByExtension(filepath.Ext(path)))
	w.WriteHeader(200)
	_, _ = w.Write(content)
}
