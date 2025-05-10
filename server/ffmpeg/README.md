# Overview

This is a rest api that provides all required services from the [ffmpeg](https://ffmpeg.org/) cli installed on the api server to provide audio and video conversion services.  This is part of the larger guitar-learning application, which is begin developed on an older Mac (2015), upon which ffmpeg is difficult if not impossible to install.  There is no issue using ffmpeg on docker, however, so the strategy is to run a rest api in the docker container that provides all the audio/video conversion services the guitar-learning application requires.

## API Documentation

### Swagger UI
The API documentation is available through Swagger UI. Once the server is running, you can access it at:

```
http://localhost:3001/api-docs
```

The Swagger UI provides:
- Interactive API documentation
- Request/response schemas
- Example requests
- Try-it-out functionality

## Running

The application can be started in two different modes: normal and debug.

To start normally, run this command from the ffmpeg_server folder:

```bash
docker-compose up -d --build
```

While developing the application, it is often desirable to debug the application from the editor.  This is more complicated than is typical because the code needs to run in the docker container due to the need for a local installation of ffmpeg.  Instead of running the server locally from the editor, the remote (on docker) application needs to be started in debug mode so that a remote debug connection can be established from the editor, after which breakpoints can be triggered on the local development system.

First the docker-container needs to be started in debug mode:

```bash
DEBUG=true docker-compose up -d --build
```

Once started in debug mode, you can start the debugger in VSCode with this launch configuration:

```json
    {
        "type": "node",
        "request": "attach",
        "name": "Docker: Attach to FFmpeg Server",
        "port": 9229,
        "address": "localhost",
        "localRoot": "${workspaceFolder}/ffmpeg_server",
        "remoteRoot": "/usr/src/app",
        "skipFiles": [
            "<node_internals>/**"
        ],
        "sourceMaps": true,
        "outFiles": [
            "${workspaceFolder}/ffmpeg_server/dist/**/*.js"
        ],
        "resolveSourceMapLocations": [
            "${workspaceFolder}/ffmpeg_server/**",
            "!**/node_modules/**"
        ],
        "restart": true,
        "timeout": 30000,
        "continueOnAttach": true
    }
```







