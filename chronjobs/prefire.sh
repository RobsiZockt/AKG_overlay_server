#!/bin/bash

set -e

echo "Starting Prefireing..."

docker compose -f ../server/docker-compose.yml --profile maintenance run --rm db_maintenance

echo "Created DB snapshot"
sleep 1m
echo "Progessing new results..."

curl - X POST https://ow.robsizockt.de/api/pred/runupdate/pf \
    -H "Content-Type: application/json"

echo "called update, check docker logs"

