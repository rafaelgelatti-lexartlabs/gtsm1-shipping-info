#!/bin/bash
docker compose  -f 'compose.prod.yaml' -f 'compose.yaml' up -d --build