#!/bin/bash

echo "🔄 Restarting Home Assistant with proxy configuration..."
echo ""

cd /workspaces/SmartHome_JustClick

# Restart just the homeassistant container
docker-compose restart homeassistant

echo ""
echo "⏳ Waiting for Home Assistant to restart (30 seconds)..."
sleep 30

echo ""
echo "📊 Container status:"
docker ps | grep homeassistant || docker ps -a | grep homeassistant

echo ""
echo "📝 Checking logs:"
docker logs --tail 20 homeassistant

echo ""
echo "✅ Done!"
echo ""
echo "🌐 Try accessing: http://localhost:8123"
echo ""
echo "📖 View live logs:"
echo "   docker logs -f homeassistant"
