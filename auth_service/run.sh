#!/usr/bin/env bash

source ../.env

export HOST="0.0.0.0"
export PORT="8004"
export ORY_URL="http://localhost:4445"
export PG_CONFIG="host=localhost user=postgres password=${AUTH_SERVICE_DB_PASSWORD}"
export OAUTH2_CLIENT_REDIRECT_URIS="https://localhost:8000/plans"
export OAUTH2_CLIENT_ID="training_app"
# export DEBUG="true"

./auth_service
