CPU_CORES=$(shell nproc)
docker-base:
	docker buildx build -f docker/base.dockerfile --build-arg cpu_cores=$(CPU_CORES) -t metagigachad/chad-apps-gateway-base . --progress plain
docker-build:
	docker buildx build -f docker/build.dockerfile --build-arg cpu_cores=$(CPU_CORES) -t metagigachad/chad-apps-gateway . --progress plain
