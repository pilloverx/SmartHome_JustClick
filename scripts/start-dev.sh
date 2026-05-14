#!/bin/bash
set -e

echo "🚀 Smart Home Stack Startup"
echo "==========================="
echo "Timestamp: $(date)"
echo ""

# Ensure we're in the right location
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: docker-compose.yml not found"
    echo "Please run this script from /workspaces/SmartHome_JustClick"
    exit 1
fi

# Check Docker daemon
echo "🔍 Checking Docker daemon..."
if ! docker ps > /dev/null 2>&1; then
    echo "⚠️  Docker daemon is not responding"
    echo "   Attempting to start Docker..."
    sudo service docker start
    sleep 3
fi

echo "✅ Docker daemon is running"
echo ""

# Stop any existing containers (clean slate)
echo "🛑 Stopping existing containers (if any)..."
docker-compose down 2>/dev/null || true
sleep 2

# Validate docker-compose.yml
echo "✓ Docker compose configuration:"
docker-compose config > /dev/null && echo "  ✅ Valid"

# Pull latest images
echo ""
echo "📥 Pulling latest images..."
docker-compose pull

# Start the stack
echo ""
echo "🏗️  Starting containers..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to initialize (30 seconds)..."
sleep 30

# Check status
echo ""
echo "📊 Container Status:"
docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "✅ Stack startup complete!"
echo ""
echo "🌐 Access Points:"
echo "   • Home Assistant:  http://localhost:8123"
echo "   • ESPHome:         http://localhost:6052"
echo ""
echo "📝 Commands:"
echo "   View logs:         docker logs -f homeassistant"
echo "   Stop stack:        docker-compose down"
echo "   Full diagnostics:  ./scripts/check-containers.sh"
echo ""
echo "⏳ Home Assistant may take 3-5 minutes to fully initialize on first startup."
echo "   If port 8123 shows error, wait and refresh the browser."
echo ""

