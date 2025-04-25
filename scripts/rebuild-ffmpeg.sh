#!/bin/bash
cd ffmpeg_server && yarn build && cd ..

echo "Stopping ffmpeg_server..."
./scripts/docker-compose-dev.sh stop ffmpeg_server

echo "Pruning everything that isn't running..."
docker system prune -a --volumes -f

echo "Rebuilding and starting ffmpeg_server..."
./scripts/docker-compose-dev.sh up -d --build ffmpeg_server

echo "Done!"