#!/bin/sh
# Verifica se NODE_ENV é igual a production
if [ "$NODE_ENV" = "production" ]; then
  echo "Production: Starting http-server..."
  exec npx http-server ./build -p 8000
else
  echo "Develop or QA..."
  exec npm start
fi
