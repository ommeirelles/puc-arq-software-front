imageName := arq-soft-front
containerName := arq-soft-front
exposedPort := 4173

.PHONY: build run dev down stop

build:
	- docker stop $(containerName)
	- docker rm $(containerName)
	docker build -t $(imageName) .

run: build
	docker run --name $(containerName) --rm -p $(exposedPort):80 $(imageName)

dev:
	- docker-compose down --remove-orphans
	docker-compose up --build --watch

down:
	- docker-compose down --remove-orphans

stop:
	- docker stop $(containerName)
	- docker rm $(containerName)
