#!/bin/bash

echo "🆘 SMART HOME STACK - TROUBLESHOOTING GUIDE"
echo "==========================================="
echo ""

cat << 'EOF'

### PROBLEM: Port 8123 showing "400 Bad Request"
### SOLUTION:

1. **Home Assistant is probably still initializing** (first startup takes 3-5 minutes)
   
   Check the logs:
   ```bash
   docker logs -f homeassistant
   ```
   
   Look for: "Home Assistant is ready" or "Setup passed"
   
   ✅ If you see this, wait 1-2 more minutes and refresh the browser.

2. **If still failing after 10 minutes:**
   ```bash
   # Stop everything
   docker-compose down
   
   # Check if port 8123 is really available
   lsof -i :8123
   
   # Remove the container and start fresh
   docker rm -f homeassistant
   docker-compose up -d homeassistant
   
   # Monitor the startup
   docker logs -f homeassistant
   ```

---

### PROBLEM: Port 8080 showing "502 Bad Gateway"
### SOLUTION:

The OpenClaw image might not exist or might be failing. 

**Current Status:** OpenClaw is COMMENTED OUT in docker-compose.yml

To re-enable OpenClaw later:
1. Verify the image exists: `docker pull ghcr.io/openclaw/openclaw:latest`
2. Uncomment the `openclaw:` section in docker-compose.yml
3. Restart: `docker-compose up -d`

For now, you can access Home Assistant without it.

---

### PROBLEM: Port 6052 (ESPHome) not responding
### SOLUTION:

Check if ESPHome container is running:
```bash
docker ps | grep esphome
```

If not running, check logs:
```bash
docker logs esphome
```

Restart ESPHome:
```bash
docker-compose restart esphome
```

---

### GENERAL RECOVERY STEPS:

1. **Stop everything and start fresh:**
   ```bash
   cd /workspaces/SmartHome_JustClick
   docker-compose down -v        # Remove volumes too
   docker system prune -f         # Clean up
   docker-compose up -d           # Start fresh
   ```

2. **Monitor startup in real-time:**
   ```bash
   # Terminal 1: Watch containers start
   watch docker ps
   
   # Terminal 2: View Home Assistant logs
   docker logs -f homeassistant
   ```

3. **Wait for Health Check:**
   Once docker ps shows:
   ```
   homeassistant    Up X seconds (health: starting)
   ```
   
   Wait for it to change to:
   ```
   homeassistant    Up X minutes (health: healthy)
   ```
   
   Then Home Assistant is ready!

4. **Access Home Assistant:**
   ```
   http://localhost:8123
   ```

---

### USEFUL COMMANDS:

```bash
# View all containers (including stopped)
docker ps -a

# View real-time logs
docker logs -f homeassistant

# View last N lines
docker logs --tail 50 homeassistant

# Enter container shell
docker exec -it homeassistant bash

# Check resource usage
docker stats

# Stop specific container
docker stop homeassistant

# Remove everything and start clean
docker-compose down -v && docker-compose up -d
```

---

### QUICK DIAGNOSIS:

Run this to see what's actually happening:
```bash
./scripts/check-containers.sh
```

This will show:
- Running containers
- Recent logs
- Network status
- Disk usage
- Port listening status

---

### IF NOTHING WORKS:

```bash
# Nuclear reset
docker-compose down -v
docker system prune -a -f
docker image prune -a -f

# Start completely fresh
docker-compose pull
docker-compose up -d

# Monitor
docker logs -f homeassistant
```

---

EOF

echo ""
echo "Need more help? Run:"
echo "  ./scripts/check-containers.sh   # Full diagnostics"
echo "  ./scripts/recover.sh            # Recovery mode"
echo ""
