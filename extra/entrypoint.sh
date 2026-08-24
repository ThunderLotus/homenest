#!/bin/sh
set -e

DATA_DIR="/app/data"
SAMPLE_CONFIG="/app/config.sample.yml"

mkdir -p "$DATA_DIR"

if [ ! -f "$DATA_DIR/config.yml" ] && [ -f "$SAMPLE_CONFIG" ]; then
  cp "$SAMPLE_CONFIG" "$DATA_DIR/config.yml"
  echo "[entrypoint] Initialized data/config.yml from sample"
fi

if [ ! -f "$DATA_DIR/.session-secret" ]; then
  node -e "const c=require('crypto');process.stdout.write(c.randomBytes(32).toString('hex'))" > "$DATA_DIR/.session-secret"
  echo "[entrypoint] Generated session secret"
fi

exec "$@"