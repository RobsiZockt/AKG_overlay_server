#!/bin/bash

set -e

echo "Starting Prefireing..."

docker compose -f ../server/docker-compose.yml --profile maintenance run --rm db_maintenance

echo "Created DB snapshot"
sleep 1m

echo "Logging in..."

TOKEN=$(curl -s -X POST ow.localhost/api/login\
    -H "Content-Type: application/json" \
    -d '{"username":"scripted_updater","password":"[replace with generated]"}' \
    | sed -E 's/.*"token":"([^"]+)".*/\1/')

echo "Progessing new results..."

curl -X POST ow.localhost/api/pred/runupdate/pf \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN"

echo "called update, check docker logs"

