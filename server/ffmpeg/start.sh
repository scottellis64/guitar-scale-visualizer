#!/bin/sh

if [ "$DEBUG_MODE" = "true" ]; then
    # Debug mode - use nodemon to keep the process running
    npx nodemon --inspect=0.0.0.0:9229 --enable-source-maps dist/index.js
else
    # Non-debug mode - simple node execution
    node dist/index.js
fi 