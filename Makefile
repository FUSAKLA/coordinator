
BINARY:=coordinator

.PHONY: all
all: static build

.PHONY: static
static:
	cd web && yarn build
	statik -src=./web/build

.PHONY: build
build:
	go build -o $(BINARY) cmd/coordinator/main.go

clean:
	rm -rf $(BINARY) ./statik
