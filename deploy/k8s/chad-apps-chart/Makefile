.PHONY: migrate_up migrate_down
migrate_up migrate_down: migrate_%:
	@helm template chad-apps ../jobs -f values.yaml --set training.jobs.migrateOp="$*" | kubectl apply -f -
	@while true; do kubectl logs $$(kubectl get pods --no-headers -o custom-columns=":metadata.name" | grep 'training-postgres-migration') --follow 2>/dev/null && break || sleep 1; done
	@kubectl delete job training-postgres-migration

.PHONY: migrate_custom
migrate_custom:
	@helm template chad-apps ../jobs -f values.yaml --set training.jobs.migrateOp="$(CMD)" | kubectl apply -f -
	@while true; do kubectl logs $$(kubectl get pods --no-headers -o custom-columns=":metadata.name" | grep 'training-postgres-migration') --follow 2>/dev/null && break || sleep 1; done
	@kubectl delete job training-postgres-migration
