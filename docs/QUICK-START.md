# Quick Start Guide

**Get running in 5 minutes.**

## Step 1: Start the Stack

```bash
cd /workspaces/SmartHome_JustClick
./scripts/start-dev.sh
```

Wait for output:
```
✅ Stack startup complete!
📊 Container Status:
homeassistant    Up X seconds
esphome          Up X seconds
```

## Step 2: Access Home Assistant

Open your browser:
```
http://localhost:8123
```

**If port 8123 shows error:** Wait 2-3 more minutes. Home Assistant initializes on first run.

View logs to monitor startup:
```bash
docker logs -f homeassistant
```

## Step 3: Complete Initial Setup

1. **Create Admin Account**
   - Username: your choice
   - Password: your choice
   - Click "Create Account"

2. **Configure Location** (optional)
   - Set your timezone
   - Set coordinates (for sunrise/sunset automations)
   - Click "Finish"

3. **Home Assistant is ready!**

## Step 4: Add Your First Device

### Option A: Use Cloud API (Easiest, 5 min)

For Nest, Ring, Hue, etc. that have cloud support:

1. Go to: **Settings** → **Devices & Services**
2. Click **"Create Integration"**
3. Search for your device brand (e.g., "Nest", "Ring")
4. Follow login prompts
5. Device appears in dashboard

### Option B: ESPHome Device (10 min)

For custom ESP32 boards:

1. Edit: `esphome/prototypes/my_device.yaml`
2. Add your device config
3. Go to: **Settings** → **Devices & Services**
4. Click **ESPHome** integration
5. Device auto-discovers

## Step 5: Create Your First Automation

1. Go to: **Automations & Scenes**
2. Click **"Create Automation"** → **"Create New Automation"**
3. Set a trigger: "At sunset"
4. Set an action: "Turn on living room light"
5. Click **"Save"**

Done! ✅

## Commands Reference

```bash
# View logs
docker logs -f homeassistant

# Stop everything
docker-compose down

# Check status
docker ps

# Full diagnostics
./scripts/docker-diagnostic.sh

# Restart Home Assistant
docker-compose restart homeassistant
```

## Troubleshooting

**Port 8123 is slow**
- First startup: 3-5 minutes normal
- View logs: `docker logs -f homeassistant`
- Look for "Setup passed" = ready

**Container won't start**
```bash
./scripts/recover.sh
```

**Permission errors**
```bash
sudo chown -R $USER:$USER homeassistant/.storage
```

## Next Steps

- [README.md](README.md) - Full documentation
- [foundation.md](foundation.md) - Architecture details
- [docs/DEVICE-SETUP.md](docs/DEVICE-SETUP.md) - Per-device guides
