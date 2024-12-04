DOCKERFILES_DIR ?= deploy/docker
PROJECT_ROOT ?= ..
IMAGE_PREFIX ?= metagigachad/private:chad_apps

IMAGE = $(IMAGE_PREFIX)-$*

.PHONY: build_auth_frontend build_onboarding_frontend build_auth_service build_onboarding_service build_training_frontend build_training_service
build_auth_frontend build_onboarding_frontend build_auth_service build_onboarding_service build_training_frontend build_training_service: build_%:
	@echo Building $*; \
	docker build \
		--shm-size 2GiB \
		-f $(PROJECT_ROOT)/$(DOCKERFILES_DIR)/$*/Dockerfile \
		--build-arg dockerfile_dir=$(DOCKERFILES_DIR)/$* \
		--build-arg app_dir=$* \
		-t $(IMAGE) \
		$(PROJECT_ROOT)

.PHONY: fast_build_training_service
fast_build_training_service: fast_build_%:
	@echo Building $*; \
	docker build \
		--shm-size 2GiB \
		-f $(PROJECT_ROOT)/$(DOCKERFILES_DIR)/$*/fast.dockerfile \
		--build-arg dockerfile_dir=$(DOCKERFILES_DIR)/$* \
		--build-arg app_dir=$* \
		-t $(IMAGE) \
		$(PROJECT_ROOT)

.PHONY: minikube_update_training_service
minikube_update_training_service: minikube_update_%:
	eval $$(minikube -p minikube docker-env) && docker build \
		--shm-size 2GiB \
		-f $(PROJECT_ROOT)/$(DOCKERFILES_DIR)/$*/fast.dockerfile \
		--build-arg dockerfile_dir=$(DOCKERFILES_DIR)/$* \
		--build-arg app_dir=$* \
		-t $(IMAGE) \
		$(PROJECT_ROOT)
	kubectl rollout restart deployment $$(echo $* | tr '_' '-')

	

.PHONY: push_auth_frontend push_onboarding_frontend push_auth_service push_onboarding_service push_training_frontend push_training_service
push_auth_frontend push_onboarding_frontend push_auth_service push_onboarding_service push_training_frontend push_training_service: push_%:
	@echo Pushing $*; \
	docker push $(IMAGE)
