#!/bin/bash
set -e

echo "🔍 Smart Home Docker Diagnostic Report"
echo "========================================"
echo ""

# 1. Check Docker Installation
echo "1️⃣  Docker Installation"
echo "------------------------"
if command -v docker &> /dev/null; then
    echo "✅ Docker is installed"
    docker --version
else
    echo "❌ Docker is NOT installed"
    echo "   Install with: sudo apt-get install -y docker.io"
fi
echo ""

# 2. Check Docker Daemon
echo "2️⃣  Docker Daemon Status"
echo "------------------------"
if docker ps > /dev/null 2>&1; then
    echo "✅ Docker daemon is running"
else
    echo "❌ Docker daemon is NOT running"
    echo "   Start with: sudo service docker start"
fi
echo ""

# 3. Check Docker Compose
echo "3️⃣  Docker Compose Installation"
echo "--------------------------------"
if command -v docker-compose &> /dev/null; then
    echo "✅ Docker Compose is installed"
    docker-compose --version
else
    echo "❌ Docker Compose is NOT installed"
    echo "   Install with: sudo apt-get install -y docker-compose"
fi
echo ""

# 4. Check docker-compose.yml
echo "4️⃣  docker-compose.yml File"
echo "----------------------------"
if [ -f "docker-compose.yml" ]; then
    echo "✅ docker-compose.yml exists in current directory"
    echo "   Location: $(pwd)/docker-compose.yml"
else
    echo "❌ docker-compose.yml NOT found"
    echo "   Current directory: $(pwd)"
    echo "   Please run this from /workspaces/SmartHome_JustClick"
fi
echo ""

# 5. Check Docker Images
echo "5️⃣  Downloaded Docker Images"
echo "-----------------------------"
IMAGES=$(docker images -q 2>/dev/null | wc -l)
if [ "$IMAGES" -gt 0 ]; then
    echo "✅ Docker images available: $IMAGES"
    docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"
else
    echo "⚠️  No Docker images downloaded yet"
    echo "   Images will be pulled when running: docker-compose up -d"
fi
echo ""

# 6. Check Running Containers
echo "6️⃣  Running Containers"
echo "----------------------"
RUNNING=$(docker ps -q 2>/dev/null | wc -l)
if [ "$RUNNING" -gt 0 ]; then
    echo "✅ $RUNNING container(s) running:"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
else
    echo "⚠️  No containers currently running"
    echo "   Start with: ./scripts/start-dev.sh"
fi
echo ""

# 7. Check Folder Structure
echo "7️⃣  Folder Structure"
echo "--------------------"
for folder in homeassistant openclaw-skills esphome docs scripts; do
    if [ -d "$folder" ]; then
        echo "✅ $folder/"
    else
        echo "❌ $folder/ NOT FOUND"
    fi
done
echo ""

# 8. Check Permissions
echo "8️⃣  Docker Socket Permissions"
echo "-----------------------------"
if [ -S /var/run/docker.sock ]; then
    if [ -w /var/run/docker.sock ]; then
        echo "✅ Docker socket is writable"
    else
        echo "⚠️  Docker socket exists but not writable"
        echo "   Fix with: sudo usermod -aG docker $USER"
        echo "   Then restart your terminal"
    fi
else
    echo "❌ Docker socket not found"
fi
echo ""

echo "✨ Diagnostic complete!"
echo ""
echo "📝 Next steps:"
echo "   1. If all checks ✅, run: ./scripts/start-dev.sh"
echo "   2. If any ❌, run: ./scripts/install-tools.sh"
