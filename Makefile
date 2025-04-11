imageName = "arq-soft-front"
exposedPort = 4173

build:
	- docker stop $(imageName)
	- docker rm $(imageName)
	docker build -t $(imageName) .

run: build
	docker run --rm -p $(exposedPort):$(exposedPort) $(imageName)

dev:
	docker compose up --build --watch