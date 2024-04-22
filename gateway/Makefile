CMAKE_FLAGS =
CMAKE_DEBUG_FLAGS = ${CMAKE_FLAGS} -DCMAKE_EXPORT_COMPILE_COMMANDS=ON
CMAKE_RELEASE_FLAGS = ${CMAKE_FLAGS}
CMAKE_DEBUG_DIR = ./build/Debug
CMAKE_RELEASE_DIR = ./build/Release
BUILD_CORES = 12
DOCKER_TAG = metagigachad/chad-apps-gateway

.PHONY: configure-debug
configure-debug:
	mkdir -p ${CMAKE_DEBUG_DIR}
	cmake -DCMAKE_BUILD_TYPE=Debug ${CMAKE_DEBUG_FLAGS} -B ${CMAKE_DEBUG_DIR} .

.PHONY: build-debug
build-debug:
	cmake --build ${CMAKE_DEBUG_DIR} -j ${BUILD_CORES}

.PHONY: clean-debug
clean-debug:
	rm -rf ${CMAKE_DEBUG_DIR}

.PHONY: configure-release
configure-release:
	mkdir -p ${CMAKE_RELEASE_DIR}
	cmake -DCMAKE_BUILD_TYPE=Release ${CMAKE_RELEASE_FLAGS} -B ${CMAKE_RELEASE_DIR} .

.PHONY: build-debug
build-release:
	cmake --build ${CMAKE_RELEASE_DIR} -j ${BUILD_CORES}

.PHONY: clean-release
clean-release:
	rm -rf ${CMAKE_RELEASE_DIR}

.PHONY: docker-build
docker-build:
	docker build --shm-size=2gb -f scripts/docker/build.dockerfile -t ${DOCKER_TAG} --progress plain .

.PHONY: docker-run-ti
docker-run-ti:
	docker run --shm-size=2gb -ti ${DOCKER_TAG} /bin/sh

.PHONY: copy-deps-release
copy-deps-release:
	cd ${CMAKE_RELEASE_DIR}; \
	mkdir deps-copy; \
	cd deps-copy; \
	ldd ../gateway | awk '{ print $$3 }' | sed '/^$$/d' | sed -E 's/(.*)\//\1 /'  \
		| awk '{ print "mkdir -p ." $$1 "; cp " $$1 "/" $$2 " ." $$1 "/" $$2 }' | bash

.PHONY: copy-deps-debug
copy-deps-debug:
	cd ${CMAKE_DEBUG_DIR}; \
	mkdir deps-copy; \
	cd deps-copy; \
	ldd ../gateway | awk '{ print $$3 }' | sed '/^$$/d' | sed -E 's/(.*)\//\1 /'  \
		| awk '{ print "mkdir -p ." $$1 "; cp " $$1 "/" $$2 " ." $$1 "/" $$2 }' | bash

