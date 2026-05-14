#!/bin/bash
set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║     SMARTHOME RESOURCE ASSESSMENT - DETAILED REPORT       ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# ════════════════════════════════════════════════════════════════
# 1. DISK SPACE ANALYSIS
# ════════════════════════════════════════════════════════════════

echo "📊 1. DISK SPACE ANALYSIS"
echo "════════════════════════════════════════════════════════════"
echo ""

echo "System-wide disk usage:"
df -h / | tail -1
echo ""

echo "Codespace workspace usage:"
du -sh /workspaces/SmartHome_JustClick
echo ""

echo "Docker volumes breakdown:"
docker volume ls --format "table {{.Name}}\t{{.Mountpoint}}"
echo ""

echo "Individual container storage:"
docker ps -a --format "table {{.Names}}\t{{.Size}}"
echo ""

echo "Ollama models directory size:"
if [ -d /root/.ollama/models ]; then
    du -sh /root/.ollama/models
else
    echo "No Ollama models directory found yet"
fi
echo ""

# ════════════════════════════════════════════════════════════════
# 2. MEMORY & RAM ANALYSIS
# ════════════════════════════════════════════════════════════════

echo "🧠 2. MEMORY & RAM ANALYSIS"
echo "════════════════════════════════════════════════════════════"
echo ""

echo "System memory:"
free -h
echo ""

echo "Memory by container:"
docker stats --no-stream --format "table {{.Container}}\t{{.MemUsage}}\t{{.MemPerc}}"
echo ""

echo "Swap status:"
swapon --show
echo ""

# ════════════════════════════════════════════════════════════════
# 3. OLLAMA MODELS
# ════════════════════════════════════════════════════════════════

echo "🤖 3. OLLAMA MODELS"
echo "════════════════════════════════════════════════════════════"
echo ""

if docker ps | grep -q ollama; then
    echo "✅ Ollama container is running"
    echo ""
    echo "Downloaded models:"
    docker exec ollama ollama list 2>/dev/null || echo "No models found"
else
    echo "❌ Ollama container is not running"
fi
echo ""

# ════════════════════════════════════════════════════════════════
# 4. DOCKER VOLUME DETAILS
# ════════════════════════════════════════════════════════════════

echo "🐳 4. DOCKER STORAGE DETAILS"
echo "════════════════════════════════════════════════════════════"
echo ""

echo "Docker system usage:"
docker system df
echo ""

echo "Docker disk pruning available:"
docker system df --verbose | grep -A 5 "Images unused" || echo "System clean"
echo ""

# ════════════════════════════════════════════════════════════════
# 5. BREAKDOWN BY COMPONENT
# ════════════════════════════════════════════════════════════════

echo "📈 5. BREAKDOWN BY COMPONENT"
echo "════════════════════════════════════════════════════════════"
echo ""

echo "Home Assistant directory:"
du -sh homeassistant 2>/dev/null || echo "Not found"
echo ""

echo "ESPHome directory:"
du -sh esphome 2>/dev/null || echo "Not found"
echo ""

echo "Repository size:"
du -sh . 2>/dev/null
echo ""

# ════════════════════════════════════════════════════════════════
# 6. RECOMMENDATIONS
# ════════════════════════════════════════════════════════════════

echo "💡 6. RESOURCE RECOMMENDATIONS"
echo "════════════════════════════════════════════════════════════"
echo ""

# Check available space
AVAILABLE=$(df /workspaces | awk 'NR==2 {print $4}')
AVAILABLE_GB=$((AVAILABLE / 1024 / 1024))
echo "Available disk space: ${AVAILABLE_GB}GB"

if [ "$AVAILABLE_GB" -lt 5 ]; then
    echo "⚠️  WARNING: Less than 5GB available - consider cleanup"
else
    echo "✅ Sufficient disk space"
fi
echo ""

# Check total memory
TOTAL_MEM=$(free -g | awk 'NR==2 {print $2}')
echo "Total system memory: ${TOTAL_MEM}GB"

if [ "$TOTAL_MEM" -lt 4 ]; then
    echo "⚠️  WARNING: Less than 4GB RAM - limited to orca-mini only"
elif [ "$TOTAL_MEM" -lt 8 ]; then
    echo "ℹ️  Recommended: Use orca-mini (safe) or mistral (with swap)"
else
    echo "✅ Can run mistral or larger models"
fi
echo ""

# ════════════════════════════════════════════════════════════════
# 7. MODEL RECOMMENDATIONS
# ════════════════════════════════════════════════════════════════

echo "🎯 7. MODEL SIZE RECOMMENDATIONS"
echo "════════════════════════════════════════════════════════════"
echo ""

cat << 'EOF'
Your Codespaces Configuration:
├─ Storage Limit:     32 GB
├─ Memory Limit:      8 GB
└─ Disk Available:    ~25-28 GB

Model Recommendations:
┌─ ORCA-MINI (1.5GB) ✅ RECOMMENDED
│  ├─ Disk needed:    1.5 GB
│  ├─ RAM needed:     1.5 GB active
│  ├─ Response time:  1-2 sec
│  └─ Use case:       All Codespaces configurations
│
├─ NEURAL-CHAT (5GB) ⚠️  CAUTION
│  ├─ Disk needed:    5 GB
│  ├─ RAM needed:     3-4 GB active
│  ├─ Response time:  2-3 sec
│  └─ Use case:       8GB+ RAM only
│
└─ MISTRAL (7GB) ❌ NOT RECOMMENDED
   ├─ Disk needed:    7 GB
   ├─ RAM needed:     4-6 GB active
   ├─ Response time:  3-5 sec
   └─ Use case:       Raspberry Pi 4GB+ or servers only
EOF

echo ""

# ════════════════════════════════════════════════════════════════
# 8. CLEANUP RECOMMENDATIONS
# ════════════════════════════════════════════════════════════════

echo "🧹 8. CLEANUP OPTIONS"
echo "════════════════════════════════════════════════════════════"
echo ""

echo "To free up space:"
echo ""
echo "# Remove unused Docker images"
echo "docker image prune -a"
echo ""
echo "# Remove unused containers"
echo "docker container prune"
echo ""
echo "# Remove unused volumes"
echo "docker volume prune"
echo ""
echo "Combined cleanup:"
echo "docker system prune -a"
echo ""

echo "════════════════════════════════════════════════════════════"
echo "✨ Assessment complete!"
echo "════════════════════════════════════════════════════════════"
