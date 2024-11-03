# repos

.PHONY: get_repos
get_repos: repo_add_jetstack repo_add_ory repo_add_prometheus repo_add_gatekeeper
	helm repo update

.PHONY: repo_add_jetstack
repo_add_cert_manager:
	helm repo add jetstack https://charts.jetstack.io

.PHONY: repo_add_prometheus
repo_add_prometheus:
	helm repo add prometheus-community https://prometheus-community.github.io/helm-charts

.PHONY: repo_add_ory
repo_add_ory:
	helm repo add ory https://k8s.ory.sh/helm/charts

.PHONY: repo_add_gatekeeper
repo_add_gatekeeper:
	helm repo add gatekeeper https://open-policy-agent.github.io/gatekeeper/charts

# gatekeeper

.PHONY: install_gatekeeper
install_gatekeeper:
	helm install \
		gatekeeper gatekeeper/gatekeeper \
		--namespace gatekeeper-system \
		--create-namespace \
		-f values/gatekeeper.yaml

.PHONY: upgrade_gatekeeper
upgrade_gatekeeper:
	helm upgrade \
		gatekeeper gatekeeper/gatekeeper \
		--namespace gatekeeper-system \
	    -f values/gatekeeper.yaml

# cert-manager

.PHONY: install_cert_manager
install_cert_manager:
	helm install \
	  cert-manager jetstack/cert-manager \
	  --namespace cert-manager \
	  --create-namespace \
	  --version 1.16.1 \
	  -f values/cert-manager.yaml

.PHONY: update_cert_manager
upgrade_cert_manager:
	helm upgrade \
	  cert-manager jetstack/cert-manager \
	  --namespace cert-manager \
	  -f values/cert-manager.yaml

# trust-manager

.PHONY: install_trust_manager
install_trust_manager:
	helm install \
	  trust-manager jetstack/trust-manager \
	  --namespace cert-manager \
	  --create-namespace \
	  -f values/trust-manager.yaml

.PHONY: update_trust_manager
upgrade_trust_manager:
	helm upgrade \
	  trust-manager jetstack/trust-manager \
	  --namespace cert-manager \
	  -f values/trust-manager.yaml

# prometheus

.PHONY: install_prometheus
install_prometheus:
	helm install \
	  prometheus prometheus-community/prometheus \
	  --namespace prometheus \
	  --create-namespace \
	  --version 25.27.0 \
	  -f values/prometheus.yaml

.PHONY: upgrade_prometheus
upgrade_prometheus:
	helm upgrade \
	  prometheus prometheus-community/prometheus \
	  --namespace prometheus \
	  -f values/prometheus.yaml

# hydra

.PHONY: install_hydra
install_hydra:
	helm install \
	  hydra ory/hydra \
	  --namespace hydra \
	  --create-namespace \
	  -f values/hydra.yaml

.PHONY: upgrade_hydra
upgrade_hydra:
	helm upgrade \
	  hydra ory/hydra \
	  --namespace hydra \
	  -f values/hydra.yaml
