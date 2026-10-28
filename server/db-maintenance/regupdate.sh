#!/bin/bash

set -e

echo "Progessing Last weaks results..."

curl - X POST ow.localhost:/api/pred/runupdate/latest \
    -H "Content-Type: application/json"

echo "called update, check docker logs"

