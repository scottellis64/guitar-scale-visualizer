FROM python:3.11-slim

# Install ffmpeg and other dependencies
RUN apt-get update && \
    apt-get install -y ffmpeg && \
    rm -rf /var/lib/apt/lists/*

# Install yt-dlp
RUN pip install --no-cache-dir yt-dlp

# Create downloads directory
RUN mkdir -p /downloads
WORKDIR /downloads

# Use shell as entrypoint to keep container running
ENTRYPOINT ["/bin/sh", "-c", "while true; do sleep 3600; done"] 