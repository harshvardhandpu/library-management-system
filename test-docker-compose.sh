#!/usr/bin/env bash
set -euo pipefail

# ─────────────────────────────────────────────────────────────
# Library Management System — Docker Compose Test Script
# Runs a full end-to-end verification of the Docker Compose setup.
# ─────────────────────────────────────────────────────────────

# Guard: must be run from project root
cd "$(dirname "$0")"
if [ ! -f docker-compose.yml ]; then
  echo "Error: Run this script from the project root (where docker-compose.yml is)"
  exit 1
fi

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color
PASS=0
FAIL=0
ERRORS=""

step() {
  printf "\n${YELLOW}[%s]${NC} %s\n" "$1" "$2"
}

ok() {
  echo -e "  ${GREEN}✓${NC} $1"
  ((PASS++))
}

fail() {
  echo -e "  ${RED}✗${NC} $1"
  ((FAIL++))
  ERRORS+="  ✗ $1\n"
}

# ── Prerequisites ──────────────────────────────────────────
step "1/10" "Checking prerequisites"

if ! command -v docker &>/dev/null; then
  fail "Docker is not installed"
  echo -e "\n${RED}Please install Docker first: https://docs.docker.com/get-docker/${NC}"
  exit 1
fi
ok "Docker CLI found: $(docker --version)"

if ! docker info &>/dev/null; then
  fail "Docker daemon is not running"
  echo -e "\n${RED}Please start Docker Desktop or run: sudo dockerd &${NC}"
  exit 1
fi
ok "Docker daemon is running"

if ! docker compose version &>/dev/null; then
  fail "Docker Compose v2 is not available"
  echo -e "\n${RED}Update Docker to include Compose v2 plugin${NC}"
  exit 1
fi
ok "Docker Compose v2 found: $(docker compose version --short)"

# ── Cleanup function ───────────────────────────────────────
cleanup() {
  echo ""
  step "Cleanup" "Stopping containers and removing volumes..."
  docker compose down -v 2>/dev/null || true
}
trap cleanup EXIT

# ── Check for port conflicts ──────────────────────────────
step "2/10" "Checking for port conflicts"

PORT_CONFLICT=0
for port in 8080 5173 3306; do
  if ss -tlnp "sport = :$port" 2>/dev/null | grep -q .; then
    echo -e "  ${YELLOW}⚠ Port $port is already in use${NC}"
    PORT_CONFLICT=1
  fi
done
if [ $PORT_CONFLICT -eq 1 ]; then
  echo "  Port conflicts may prevent containers from starting."
fi
ok "Port check complete"

# ── Build ──────────────────────────────────────────────────
step "3/10" "Building Docker images"

echo "  Pulling MariaDB image..."
docker compose pull mariadb 2>&1 | tail -3

echo "  Building (may take 3-5 minutes on first build)..."
BUILD_START=$(date +%s)
if docker compose build 2>&1 | tail -5; then
  BUILD_END=$(date +%s)
  ok "Images built in $((BUILD_END - BUILD_START))s"
else
  fail "Docker build failed"
  echo -e "\n${RED}Check the build output above for errors${NC}"
  exit 1
fi

# ── Start services ─────────────────────────────────────────
step "4/10" "Starting containers"

docker compose up -d --pull missing 2>&1 | tail -3
ok "Containers started (checking health in background)"

# ── Wait for MariaDB ───────────────────────────────────────
step "5/10" "Waiting for MariaDB healthcheck"

echo -n "  Waiting..."
for i in $(seq 1 30); do
  if docker inspect --format='{{.State.Health.Status}}' library-db 2>/dev/null | grep -q healthy; then
    echo ""
    ok "MariaDB is healthy"
    break
  fi
  echo -n "."
  sleep 2
done
if ! docker inspect --format='{{.State.Health.Status}}' library-db 2>/dev/null | grep -q healthy; then
  echo ""
  fail "MariaDB healthcheck timed out"
fi

# ── Wait for Backend ───────────────────────────────────────
step "6/10" "Waiting for backend healthcheck (up to 90s)"

echo -n "  Waiting..."
for i in $(seq 1 45); do
  STATUS=$(docker inspect --format='{{.State.Health.Status}}' library-backend 2>/dev/null)
  if [ "$STATUS" = "healthy" ]; then
    echo ""
    ok "Backend is healthy"
    break
  fi
  echo -n "."
  sleep 2
done
if ! docker inspect --format='{{.State.Health.Status}}' library-backend 2>/dev/null | grep -q healthy; then
  echo ""
  fail "Backend healthcheck timed out"
  echo "  Logs:"
  docker logs library-backend --tail 10 2>&1 | sed 's/^/    /'
fi

CURL="curl --connect-timeout 5 --max-time 10 -s"

# ── Test backend health endpoint ───────────────────────────
step "7/10" "Testing /actuator/health"

HEALTH=$($CURL http://localhost:8080/actuator/health 2>/dev/null || echo '{"status":"DOWN"}')
if echo "$HEALTH" | grep -q '"status":"UP"'; then
  ok "Backend health: $HEALTH"
else
  fail "Backend health check: $HEALTH"
fi

# ── Test frontend ──────────────────────────────────────────
step "8/10" "Testing frontend (Nginx)"

HTTP_CODE=$($CURL -o /dev/null -w "%{http_code}" http://localhost:5173/ 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
  ok "Frontend serves index.html (HTTP $HTTP_CODE)"
else
  fail "Frontend returned HTTP $HTTP_CODE (expected 200)"
fi

# ── Test API proxy through Nginx ───────────────────────────
step "9/10" "Testing API proxy (Nginx → Backend)"

# GET /api/books should return empty array
BOOKS=$($CURL http://localhost:5173/api/books 2>/dev/null || echo "FAILED")
if [ "$BOOKS" = "[]" ]; then
  ok "GET /api/books returns [] (empty catalog)"
else
  fail "GET /api/books returned: $BOOKS (expected [])"
fi

# Full CRUD workflow through the proxy
BOOK=$($CURL -X POST http://localhost:5173/api/books \
  -H 'Content-Type: application/json' \
  -d '{"title":"Clean Code","author":"Robert Martin","isbn":"9780132350884","quantity":3}' 2>/dev/null || echo "FAILED")

if echo "$BOOK" | grep -q '"id":1'; then
  ok "POST /api/books created book with ID 1"
else
  fail "POST /api/books failed: $BOOK"
fi

USER=$($CURL -X POST http://localhost:5173/api/users \
  -H 'Content-Type: application/json' \
  -d '{"name":"Harsh","email":"harsh@example.com","phone":"9876543210"}' 2>/dev/null || echo "FAILED")

if echo "$USER" | grep -q '"id":1'; then
  ok "POST /api/users created user with ID 1"
else
  fail "POST /api/users failed: $USER"
fi

BORROW=$($CURL -X POST http://localhost:5173/api/borrow-records/borrow \
  -H 'Content-Type: application/json' \
  -d '{"userId":1,"bookId":1}' 2>/dev/null || echo "FAILED")

if echo "$BORROW" | grep -q '"status":"BORROWED"'; then
  ok "POST /api/borrow-records/borrow created borrow record"
else
  fail "POST /api/borrow-records/borrow failed: $BORROW"
fi

# Verify available quantity decreased
BOOKS_AFTER=$($CURL http://localhost:5173/api/books 2>/dev/null)
if echo "$BOOKS_AFTER" | grep -q '"availableQuantity":2'; then
  ok "Available quantity decreased to 2 (from 3)"
else
  fail "Available quantity not updated: $BOOKS_AFTER"
fi

# Return the book
RETURN=$($CURL -X PUT "http://localhost:5173/api/borrow-records/1/return" 2>/dev/null || echo "FAILED")
if echo "$RETURN" | grep -q '"status":"RETURNED"'; then
  ok "PUT /api/borrow-records/1/return returned the book"
else
  fail "Return failed: $RETURN"
fi

# ── Summary ────────────────────────────────────────────────
step "10/10" "Test Summary"

echo ""
echo -e "  ${GREEN}Passed:${NC} $PASS"
if [ $FAIL -gt 0 ]; then
  echo -e "  ${RED}Failed:${NC} $FAIL"
  echo ""
  echo -e "${RED}Errors:${NC}"
  echo -e "$ERRORS"
else
  echo -e "  ${GREEN}Failed:${NC} 0"
fi

echo ""
echo "  Docker containers:"
docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null

echo ""
if [ $FAIL -eq 0 ]; then
  echo -e "  ${GREEN}✅ ALL TESTS PASSED${NC}"
  echo ""
  echo "  Visit http://localhost:5173 to use the application."
  echo "  Run 'docker compose down' to stop."
else
  echo -e "  ${RED}❌ $FAIL TEST(S) FAILED${NC}"
  exit 1
fi
