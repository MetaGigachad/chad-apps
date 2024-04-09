CPU_CORES=$(shell nproc)
build-env:
	docker buildx build --build-arg cpu_cores=$(CPU_CORES) -f docker/build-environment.dockerfile -t metagigachad/chad-apps-auth-proxy-build-environment . --progress plain
build-app:
	docker buildx build --build-arg cpu_cores=$(CPU_CORES) -f docker/app.dockerfile -t metagigachad/chad-apps-auth-proxy . --progress plain
