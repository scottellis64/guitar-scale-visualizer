#!/bin/bash
cd server && yarn build && cd ..

echo "Stopping server..."
./scripts/docker-compose-dev.sh stop server

echo "Pruning everything that isn't running..."
docker system prune -a --volumes -f

echo "Rebuilding and starting server..."
./scripts/docker-compose-dev.sh up -d --build server

echo "Done!"