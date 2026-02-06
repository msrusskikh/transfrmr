#!/bin/bash
# PM2 startup script that loads .env.local before starting the app

cd /root/apps/transfrmr

# Load environment variables from .env (or .env.local as fallback) if it exists
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
elif [ -f .env.local ]; then
  export $(cat .env.local | grep -v '^#' | xargs)
fi

# Start the app with PM2 using ecosystem config
pm2 start ecosystem.config.js
