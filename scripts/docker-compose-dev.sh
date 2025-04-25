#!/bin/bash

# Run docker-compose with the environment file and compose files, passing through any additional arguments
docker-compose --env-file .env.development -f docker-compose.yml -f docker-compose-dev.yml "$@" 