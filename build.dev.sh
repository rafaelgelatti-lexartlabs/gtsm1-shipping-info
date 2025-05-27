#!/bin/bash
docker compose  -f 'compose.dev.yaml' -f 'compose.yaml' up -d --build