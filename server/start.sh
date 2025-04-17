#!/bin/sh

if [ "$DEBUG_MODE" = "true" ]; then
    # Debug mode - use nodemon to keep the process running
    npx nodemon
else
    # Non-debug mode - simple node execution
    node dist/index.js
fi 