#!/bin/bash

set -e
echo "Logging in..."

TOKEN=$(curl -s -X POST ow.localhost/api/login\
    -H "Content-Type: application/json" \
    -d '{"username":"scripted_updater","password":"[replace with generated]"}' \
    | sed -E 's/.*"token":"([^"]+)".*/\1/')

echo "Progessing Last weaks results..."

curl -X POST ow.localhost/api/pred/runupdate/latest \
    -H "Content-Type: application/json"\
    -H "Authorization: Bearer $TOKEN"

echo "called update, check docker logs"

