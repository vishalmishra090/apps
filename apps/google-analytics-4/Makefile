.PHONY: all
all: help

## make start-app: Starts a docker image for dynamodb, our serverless lambda, and fromtend for local development
start-app:
	@docker compose up --build -d

logs: start-app
	@docker compose logs -f

## make clean: Remove all service containers, orphans and one off containers.
clean:
	@docker compose down -v --remove-orphans
	@docker compose rm -v

## help: Show help and exit.
help: Makefile
	@echo
	@echo "  Choose a command:"
	@echo
	@sed -n 's/^##//p' $< | column -t -s ':' |  sed -e 's/^/ /'
	@echo
