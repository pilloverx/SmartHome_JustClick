# Quick Reference: Common Port Errors

## Your Specific Errors:

### 1️⃣ Port 8123: "400 Bad Request" → Home Assistant
**Root Cause:** Usually means Home Assistant is starting up or has crashed

**Quick Fix:**
```bash
# Check if it's still initializing
docker logs -f homeassistant

# Wait for "Setup passed" message, then refresh the browser

# If stuck, restart:
docker-compose restart homeassistant
```

**Expected:**
- First startup: 3-5 minutes (pulling ~400MB image + initializing database)
- Subsequent startups: 30-60 seconds

---

### 2️⃣ Port 8080: "502 Bad Gateway" → OpenClaw
**Root Cause:** OpenClaw container is not running or image doesn't exist

**Status:** Currently disabled in `docker-compose.yml` (commented out)

**Why:** The OpenClaw image `ghcr.io/openclaw/openclaw:latest` may not be publicly available

**Solution:**
Option A (Recommended now): Skip OpenClaw for now
- Home Assistant works fine without it
- You can connect OpenClaw later when you have the credentials

Option B (If you have credentials):
1. Uncomment the `openclaw:` section in `docker-compose.yml`
2. Update the image path if needed
3. Run: `docker-compose restart`

---

### 3️⃣ Port 6052: ESPHome
**Status:** Should be working if homeassistant is healthy

**Check:**
```bash
docker ps | grep esphome
```

**Restart if needed:**
```bash
docker-compose restart esphome
```

---

## The Fix You Need Now:

```bash
cd /workspaces/SmartHome_JustClick

# Option 1: Clean restart
./scripts/start-dev.sh

# Option 2: If still broken, do full recovery
docker-compose down -v
docker system prune -f
./scripts/start-dev.sh
```

---

## Then Do This:

1. **Wait 3-5 minutes** while reading the logs:
   ```bash
   docker logs -f homeassistant
   ```

2. **Look for this line:**
   ```
   Home Assistant is ready
   ```

3. **Then access:**
   ```
   http://localhost:8123
   ```

4. **Complete Home Assistant setup** (first time only):
   - Create admin account
   - Set location/language
   - Done!

---

## Emergency Commands:

```bash
# See everything
docker ps -a

# See what's breaking
docker logs homeassistant

# Full diagnostics
./scripts/check-containers.sh

# Nuclear reset
docker-compose down -v && docker-compose up -d
```

---

## Key Points:

✅ **Home Assistant first startup is SLOW**
- Don't worry if port 8123 shows errors for 5+ minutes
- It's pulling image, creating database, initializing services

✅ **OpenClaw is currently DISABLED**
- Not blocking you from using Home Assistant
- Can be enabled later

✅ **All commands must run from:**
```
/workspaces/SmartHome_JustClick
```

---

**Status: You're close! Just need to wait for Home Assistant to initialize.**
