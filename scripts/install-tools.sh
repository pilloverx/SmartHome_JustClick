#!/bin/bash
set -e

echo "🛠️  Installing Docker & Compose Tools"
echo "===================================="
echo ""

# Update package lists
echo "📦 Updating package lists..."
sudo apt-get update

# Install Docker
echo "🐳 Installing Docker..."
sudo apt-get install -y docker.io

# Install Docker Compose
echo "📝 Installing Docker Compose..."
sudo apt-get install -y docker-compose

# Add current user to docker group (avoid needing sudo)
echo "👤 Adding user to docker group..."
sudo usermod -aG docker $USER

# Start Docker daemon if not running
echo "⚙️  Starting Docker daemon..."
sudo service docker start

# Verify installations
echo ""
echo "✅ Installation complete!"
echo ""
echo "📋 Verification:"
docker --version
docker-compose --version
echo ""

echo "⚠️  IMPORTANT: You may need to restart your terminal session"
echo "   for group changes to take effect."
echo ""
echo "🚀 Ready to start! Run:"
echo "   cd /workspaces/SmartHome_JustClick"
echo "   ./scripts/start-dev.sh"
