# Local & Raspberry Pi Integration Guide

**How to move from GitHub Codespaces to local or Raspberry Pi deployment.**

---

## Overview

| Phase | Environment | Setup | Persistence |
|-------|-------------|-------|-------------|
| **Phase 1** (Now) | GitHub Codespaces | 5 min | Temporary |
| **Phase 2** (1-2 wks) | Local Machine | 10 min | Semi-persistent |
| **Phase 3** (1-3 mo) | Raspberry Pi | 20 min | Persistent 24/7 |

---

## Phase 2: Local Docker Deployment

### When to Do This
- Testing on your laptop before production
- Running when Codespaces is not available
- Developing locally without cloud costs

### System Requirements
- **OS:** Windows 10+, macOS 11+, Ubuntu 18.04+
- **RAM:** 4 GB minimum (8 GB recommended)
- **Disk:** 10 GB free
- **Docker:** Latest version

### Step 1: Install Docker Locally

**Windows/Mac:**
1. Download Docker Desktop: https://www.docker.com/products/docker-desktop
2. Install and start

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install -y docker.io docker-compose

# Add your user to docker group
sudo usermod -aG docker $USER
# Log out and back in for changes to take effect
```

### Step 2: Clone the Repository

```bash
git clone https://github.com/yourusername/SmartHome_JustClick.git
cd SmartHome_JustClick
```

### Step 3: Start the Stack

```bash
# Make scripts executable (first time only)
chmod +x scripts/*.sh

# Start everything
./scripts/start-dev.sh

# Open http://localhost:8123 in your browser
```

### Step 4: Configure Devices

Same as Codespaces:
1. Settings → Devices & Services
2. Add your integrations (Nest, Ring, etc.)
3. Create automations

### Differences from Codespaces
- ✅ Runs indefinitely (no 60-hour limit)
- ✅ Faster performance (native CPU)
- ❌ Requires local Docker installation
- ❌ Manual startup each session
- ✅ Same configuration files work everywhere

---

## Phase 3: Raspberry Pi Production Setup

### When to Do This
- Permanent home automation (always-on)
- Local device control via Zigbee/Z-Wave
- No internet dependency for core functions
- Production reliability needed

### System Requirements
- **Hardware:** Raspberry Pi 4 (2GB+ RAM) or Pi 5
- **OS:** Raspberry Pi OS (Lite recommended)
- **Storage:** 64 GB microSD card minimum
- **Network:** Ethernet or WiFi (Ethernet recommended)
- **Power:** Reliable 5V USB-C supply

### Architecture Difference

```
GitHub Codespaces (Tests & Development)
           ↕ (Sync via Git)
Raspberry Pi at Home (Production)
    ↓ controls
Your Devices (Nest, Ring, Hue, ESPHome, etc.)
```

**Key Benefits:**
- Runs 24/7 without stopping
- Local network access to devices
- No cloud infrastructure costs
- Automations work offline

### Step 1: Prepare Raspberry Pi

```bash
# 1. Flash Raspberry Pi OS Lite to microSD
# Download: https://www.raspberrypi.com/software/

# 2. SSH into your Pi
ssh pi@raspberrypi.local
# Default password: raspberry
# CHANGE THIS IMMEDIATELY: passwd

# 3. Update system
sudo apt update && sudo apt upgrade -y

# 4. Enable SSH (if not already)
sudo raspi-config
# Interface Options → SSH → Enable
```

### Step 2: Install Docker on Raspberry Pi

```bash
# Install Docker
curl -sSL https://get.docker.com | sh

# Add pi user to docker group
sudo usermod -aG docker pi

# Install Docker Compose
sudo apt-get install -y python3-dev libffi-dev libssl-dev
sudo pip3 install docker-compose

# Verify installation
docker --version
docker-compose --version

# Log out and back in
exit
```

### Step 3: Clone Repository on Pi

```bash
# SSH back in
ssh pi@raspberrypi.local

# Clone repo
git clone https://github.com/yourusername/SmartHome_JustClick.git
cd SmartHome_JustClick

# Make scripts executable
chmod +x scripts/*.sh
```

### Step 4: Update Configuration for Raspberry Pi

Edit `docker-compose.yml`:

```yaml
services:
  homeassistant:
    image: ghcr.io/home-assistant/home-assistant:stable
    container_name: homeassistant
    
    # Add this for persistent storage across restarts
    restart: always
    
    volumes:
      - ./homeassistant:/config
      - /etc/localtime:/etc/localtime:ro
    
    ports:
      - "8123:8123"
    
    # For local device access on Raspberry Pi
    network_mode: host  # ← Add this line
    
    environment:
      - TZ=UTC
      
  esphome:
    image: esphome/esphome:latest
    container_name: esphome
    restart: always          # ← Add this line
    
    volumes:
      - ./esphome:/config
      - /run/dbus:/run/dbus  # ← Add for Zigbee access
    
    ports:
      - "6052:6052"
    
    network_mode: host  # ← Add this line
```

### Step 5: Start the Stack on Raspberry Pi

```bash
# Start in the background
./scripts/start-dev.sh

# Monitor startup
docker logs -f homeassistant

# Check status
docker ps
```

### Step 6: Access Home Assistant from Your Network

From any device on your home network:

```
http://raspberrypi.local:8123
```

Or use the Raspberry Pi's IP address:

```
http://192.168.1.100:8123  # Replace with your Pi's IP
```

### Step 7: Enable Auto-Start on Boot

```bash
# Create systemd service
sudo nano /etc/systemd/system/home-assistant-docker.service
```

Paste this:

```ini
[Unit]
Description=Home Assistant Docker Stack
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/SmartHome_JustClick
ExecStart=/usr/local/bin/docker-compose up
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Then enable:

```bash
sudo systemctl daemon-reload
sudo systemctl enable home-assistant-docker
sudo systemctl start home-assistant-docker

# Check status
sudo systemctl status home-assistant-docker
```

---

## Migration Path: Codespaces → Local → Raspberry Pi

### All Configurations Stay the Same

The beauty of this setup is your configs work everywhere:

```
homeassistant/
├── configuration.yaml     ← Works on all platforms
├── automations.yaml       ← Works on all platforms
├── blueprints/           ← Works on all platforms
└── .storage/             ← Local only, auto-generated
```

### Step-by-Step Migration

#### Step 1: Sync Configuration from Codespaces

```bash
# On your local machine with Codespaces checked out
cd SmartHome_JustClick

# Pull latest from Codespaces
git pull origin main

# Or manually copy if not using git:
# scp -r ./homeassistant/* pi@raspberrypi.local:~/SmartHome_JustClick/homeassistant/
```

#### Step 2: Update Network Settings

**In Codespaces (cloud APIs):**
```yaml
# homeassistant/configuration.yaml
http:
  use_x_forwarded_for: true
  trusted_proxies:
    - 172.16.0.0/12
```

**On Raspberry Pi (local network):**
```yaml
# homeassistant/configuration.yaml
http:
  server_port: 8123

# Add local device integrations
zha:  # Zigbee support
  device_path: /dev/ttyUSB0
  
mqtt:  # Local MQTT (if using)
  broker: localhost
  port: 1883
```

#### Step 3: Disable Cloud Integrations (Optional)

For Codespaces, keep cloud APIs. For Raspberry Pi, add local alternatives:

```yaml
# For Nest (local alternative if using local hub)
# For Ring (local alternative if available)
# For Hue (local alternative: direct API)
```

---

## Adding Local Device Protocols to Raspberry Pi

### Zigbee (Local Device Mesh)

**What you need:**
- Zigbee USB adapter ($20-40)
- Devices that support Zigbee protocol

**Setup:**

```bash
# Plug in Zigbee adapter to Raspberry Pi USB

# Check device is recognized
ls -la /dev/ttyUSB*

# Update docker-compose.yml
# (See Step 4 above)

# Restart Home Assistant
docker-compose restart homeassistant
```

Then in Home Assistant:
1. Settings → Devices & Services
2. Search for "Zigbee Home Automation"
3. Select your USB adapter
4. Pair devices

### Z-Wave (Larger Range)

Similar setup with Z-Wave USB adapter.

### Matter (Future-Proof)

Requires Matter hub (Apple TV, HomePod mini, etc.) or dedicated adapter.

---

## Managing Multiple Environments

### Keep Devices in Sync with Git

```bash
# On your main machine after changes
git add homeassistant/automations.yaml
git commit -m "Add new automation for bedroom lights"
git push

# On Raspberry Pi, pull changes
ssh pi@raspberrypi.local
cd SmartHome_JustClick
git pull origin main

# Restart to apply changes
docker-compose restart homeassistant
```

### Recommended Setup

```
Your Laptop (Codespaces/Local)
    ↓ (Git push/pull)
GitHub Repository
    ↓ (Git pull)
Raspberry Pi (Production)
    ↓ (Controls)
Your Smart Devices
```

---

## Troubleshooting Local/Pi Deployments

### Docker Won't Start on Raspberry Pi

```bash
# Check if docker daemon is running
sudo systemctl status docker

# If not, start it
sudo systemctl start docker

# Make it auto-start
sudo systemctl enable docker
```

### Zigbee Not Detected

```bash
# Check USB adapter
ls -la /dev/ttyUSB*

# If empty, check dmesg
dmesg | grep -i usb

# May need to add permissions
sudo usermod -a -G dialout pi
```

### Performance Issues

```bash
# Monitor resource usage
docker stats

# Reduce polling frequency in config
http:
  # Increase from default 15s
  timeout: 30

# Reduce automation frequency if needed
```

### Network Access Issues

```bash
# Test local access
curl http://localhost:8123

# Test from another device
curl http://raspberrypi.local:8123

# Check firewall
sudo ufw status
```

---

## Backup & Recovery on Raspberry Pi

### Backup Your Configuration

```bash
# SSH into Pi
ssh pi@raspberrypi.local

# Backup to external drive
tar -czf ~/backup-$(date +%Y%m%d).tar.gz SmartHome_JustClick/

# Copy to your machine
scp pi@raspberrypi.local:~/backup-*.tar.gz ./backups/
```

### Restore Configuration

```bash
# Extract backup
tar -xzf backup-20260320.tar.gz

# Restart
docker-compose restart
```

---

## Production Checklist for Raspberry Pi

- [ ] Docker installed & running
- [ ] Repository cloned & updated
- [ ] docker-compose.yml configured for Pi
- [ ] Home Assistant accessible at http://raspberrypi.local:8123
- [ ] Devices added and tested
- [ ] Automations created and tested
- [ ] Auto-start systemd service enabled
- [ ] Configuration backed up to git
- [ ] External backup created
- [ ] SSH password changed
- [ ] Hostname updated (optional)

---

## Cost Breakdown for Pi Setup

| Item | Cost | Notes |
|------|------|-------|
| Raspberry Pi 4 (2GB) | $45 | One-time |
| microSD 64GB | $10 | One-time |
| USB-C Power | $10 | One-time |
| Optional Zigbee Hub | $30-50 | One-time |
| **Total** | **$65-115** | **One-time cost** |
| Annual Electricity | ~$5 | 5W 24/7 |

**Total Cost: $70-120 one-time + $5/year operating**

---

## Next Steps

1. **Phase 1:** Use GitHub Codespaces for development ✅ (You're here)
2. **Phase 2:** Test on local Docker machine (1-2 weeks)
3. **Phase 3:** Deploy to Raspberry Pi (1-3 months)
4. **Phase 4:** Add local device protocols (Zigbee, Z-Wave)
5. **Phase 5:** Advanced automations & AI skills

---

## Summary

```
START HERE (Codespaces)
        ↓
        THEN (Local Docker)
        ↓
        FINALLY (Raspberry Pi @ Home)
        ↓
        Production 24/7 ✅
```

All the way with the same configuration files!

---

**For help:** See [README.md](../README.md) or [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
