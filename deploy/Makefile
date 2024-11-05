DOCKERFILES_DIR ?= deploy/docker
PROJECT_ROOT ?= ..
IMAGE_PREFIX ?= metagigachad/private:chad_apps
VALID_NAMES := auth_frontend onboarding_frontend auth_service onboarding_service training_frontend training_service

IMAGE = $(IMAGE_PREFIX)-$*

.PHONY: build_%
build_%: check_name_% 
	@echo Building $*; \
	docker build \
		--shm-size 2GiB \
		-f $(PROJECT_ROOT)/$(DOCKERFILES_DIR)/$*/Dockerfile \
		--build-arg dockerfile_dir=$(DOCKERFILES_DIR)/$* \
		--build-arg app_dir=$* \
		-t $(IMAGE) \
		$(PROJECT_ROOT)

.PHONY: build_%
push_%: check_name_%
	@echo Pushing $*; \
	docker push $(IMAGE)

.PHONY: build_all
build_all: $(addprefix build_, $(VALID_NAMES))

.PHONY: push_all
push_all: $(addprefix push_, $(VALID_NAMES))

.PHONY: check_name_%
check_name_%:
	@if ! echo $(VALID_NAMES) | grep -qw $*; then \
		echo "Invalid option '$*'. Choose from: $(VALID_NAMES)"; \
		exit 1; \
	fi;
