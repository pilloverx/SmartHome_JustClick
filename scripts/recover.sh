#!/bin/bash
set -e

echo "🔧 CONTAINER RECOVERY & RESTART"
echo "================================"
echo ""

cd /workspaces/SmartHome_JustClick

echo "Step 1: Stopping existing containers..."
docker-compose down 2>/dev/null || true
sleep 2

echo "Step 2: Removing any orphaned containers..."
docker container prune -f 2>/dev/null || true

echo "Step 3: Checking disk space..."
DISK_USAGE=$(df /workspaces/ | awk 'NR==2 {print $5}' | sed 's/%//')
echo "Disk usage: $DISK_USAGE%"
if [ "$DISK_USAGE" -gt 80 ]; then
    echo "⚠️  WARNING: Disk usage is high. This may cause issues."
    echo "   Consider cleaning: docker system prune"
fi

echo ""
echo "Step 4: Pulling fresh images (this may take 2-5 minutes)..."
docker-compose pull

echo ""
echo "Step 5: Starting containers..."
docker-compose up -d

echo ""
echo "Step 6: Waiting for containers to initialize (30 seconds)..."
sleep 30

echo ""
echo "Step 7: Verifying container status..."
docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "Step 8: Checking logs..."
echo ""
echo "--- HOME ASSISTANT LOGS (last 20 lines) ---"
docker logs --tail 20 homeassistant 2>&1 || echo "No logs"
echo ""
echo "--- OPENCLAW LOGS (last 20 lines) ---"
docker logs --tail 20 openclaw 2>&1 || echo "No logs"
echo ""

echo "✅ Recovery complete!"
echo ""
echo "📝 Next:"
echo "   • Wait 1-2 minutes for services to fully initialize"
echo "   • Try accessing: http://localhost:8123"
echo "   • View detailed logs: docker logs -f homeassistant"
