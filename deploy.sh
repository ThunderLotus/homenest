#!/usr/bin/env bash
#
# HomeNest Docker deployment script (Bash)
#
# Usage:
#   ./deploy.sh              # Build and start on port 13008
#   ./deploy.sh -p 8080      # Use custom port
#   ./deploy.sh --no-build   # Skip image build
#
set -euo pipefail

IMAGE="thunderlotus/homenest:1.0.1"
CONTAINER="homenest"
PORT=13008
NO_BUILD=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    -p|--port) PORT="$2"; shift 2 ;;
    --no-build) NO_BUILD=true; shift ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

step() { echo -e "\n\033[36m▶ $1\033[0m"; }
ok()   { echo -e "  \033[32m✓ $1\033[0m"; }
err()  { echo -e "  \033[31m✗ $1\033[0m"; }

# 1. Check Docker
step 'Checking Docker...'
if ! docker info >/dev/null 2>&1; then
  err 'Docker is not running. Please start Docker first.'
  exit 1
fi
ok 'Docker is running'

# 2. Build .output if missing
if [ ! -f '.output/server/index.mjs' ]; then
  step '.output not found, building project...'
  npm run build
  ok 'Build complete'
else
  ok '.output already exists'
fi

# 3. Build Docker image
if [ "$NO_BUILD" = false ]; then
  step "Building Docker image ($IMAGE)..."
  docker build -t "$IMAGE" -f Dockerfile.prebuilt .
  ok 'Image built'
else
  ok 'Skipped build (--no-build)'
fi

# 4. Stop existing container
step 'Stopping existing container...'
docker stop "$CONTAINER" 2>/dev/null || true
docker rm "$CONTAINER" 2>/dev/null || true
ok 'Done'

# 5. Start container
step "Starting container on port $PORT..."
DATA_DIR="$(pwd)/data"
mkdir -p "$DATA_DIR"
docker run -d --name "$CONTAINER" \
  -p "${PORT}:3000" \
  -v "${DATA_DIR}:/app/data" \
  --restart unless-stopped \
  "$IMAGE"
ok 'Container started'

# 6. Health check
step 'Waiting for health check...'
ok_flag=false
for i in $(seq 1 15); do
  sleep 1
  if curl -sf "http://localhost:$PORT" >/dev/null 2>&1; then
    ok_flag=true
    break
  fi
done
if [ "$ok_flag" = true ]; then
  ok 'Health check passed'
else
  err 'Health check failed (container may still be starting)'
fi

# 7. Summary
echo ""
echo -e "\033[33m===================================\033[0m"
echo -e "\033[33m HomeNest is running!\033[0m"
echo -e "\033[33m===================================\033[0m"
echo " URL:          http://localhost:$PORT"
echo " Container:    $CONTAINER"
echo " Image:        $IMAGE"
echo " Data volume:  $DATA_DIR"
echo " Login:        Admin / Admin"
echo ""
echo -e "\033[90m Commands:\033[0m"
echo -e "\033[90m   docker logs $CONTAINER -f       # View logs\033[0m"
echo -e "\033[90m   docker stop $CONTAINER          # Stop\033[0m"
echo -e "\033[90m   docker restart $CONTAINER       # Restart\033[0m"
echo ""