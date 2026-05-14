#!/bin/bash
set -e

echo "🔴 CONTAINER STATUS DIAGNOSTICS"
echo "=================================="
echo "Timestamp: $(date)"
echo ""

# Check all containers
echo "1️⃣  RUNNING CONTAINERS:"
echo "------------------------"
docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""

# Check each container's health
echo "2️⃣  HOME ASSISTANT STATUS:"
echo "------------------------"
if docker ps | grep -q homeassistant; then
    echo "🟢 homeassistant container is running"
    echo ""
    echo "Recent logs (last 30 lines):"
    docker logs --tail 30 homeassistant 2>&1
else
    echo "🔴 homeassistant container is NOT running"
    echo ""
    echo "Last logs before crash:"
    docker logs --tail 50 homeassistant 2>&1 || echo "No logs available"
fi
echo ""
echo "-----"
echo ""

# Check OpenClaw
echo "3️⃣  OPENCLAW STATUS:"
echo "------------------------"
if docker ps | grep -q openclaw; then
    echo "🟢 openclaw container is running"
    echo ""
    echo "Recent logs (last 30 lines):"
    docker logs --tail 30 openclaw 2>&1
else
    echo "🔴 openclaw container is NOT running"
    echo ""
    echo "Last logs before crash:"
    docker logs --tail 50 openclaw 2>&1 || echo "No logs available"
fi
echo ""
echo "-----"
echo ""

# Check ESPHome
echo "4️⃣  ESPHOME STATUS:"
echo "------------------------"
if docker ps | grep -q esphome; then
    echo "🟢 esphome container is running"
    echo ""
    echo "Recent logs (last 30 lines):"
    docker logs --tail 30 esphome 2>&1
else
    echo "🔴 esphome container is NOT running"
    echo ""
    echo "Last logs before crash:"
    docker logs --tail 50 esphome 2>&1 || echo "No logs available"
fi
echo ""
echo "-----"
echo ""

# Check disk space
echo "5️⃣  DISK SPACE:"
echo "---"
df -h /workspaces/
echo ""

# Check docker stats if any containers exist
echo "6️⃣  DOCKER STATS (if running):"
echo "---"
docker stats --no-stream 2>/dev/null || echo "No containers stats available"
echo ""

# Network check
echo "7️⃣  NETWORK & PORTS:"
echo "---"
netstat -tuln 2>/dev/null | grep -E "8123|8080|6052" || echo "Ports not listening"
echo ""

# Check docker compose validation
echo "8️⃣  DOCKER COMPOSE VALIDATION:"
echo "---"
cd /workspaces/SmartHome_JustClick
docker-compose config 2>&1 | head -20 || echo "Invalid docker-compose.yml"
echo ""

echo "✨ Diagnostics complete"
