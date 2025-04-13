# Overview

The server is a rest api that provides all back end services for the guitar-learning application.For any audio/video conversions, the server api will invoke the ffmpeg server api that is running in a docker container.

This api requires that a mongo db instance be available locally, which can be installed on your local system or started using the docker-compose available from the project root.

At present the docker-compose does not use environment variables for secrets, so the user and password are exposed.  This is an upcoming task to fix.


To build the application:
```bash
yarn 
```

## Running

Ensure that the mongo docker container is running.  Run this command from the project root:

```bash
docker-compose up -d
```

The application can be started from the server module root:

```bash
yarn start
```

During development, the server can be run in development mode, which uses nodemon to monitor for source code changes.  Any changes will cause a recompile and redeployment.

The server can also be started in VSCode as a debug configuration such that breakpoints can be triggered.  Use this launch configuration:

```json
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Server",
      "skipFiles": [
          "<node_internals>/**"
      ],
      "runtimeExecutable": "ts-node",
      "args": [
          "-r",
          "tsconfig-paths/register",
          "--project",
          "${workspaceFolder}/server/tsconfig.json",
          "${workspaceFolder}/server/src/index.ts"
      ],
      "sourceMaps": true,
      "env": {
          "NODE_ENV": "development"
      },
      "console": "integratedTerminal"
  }
```

