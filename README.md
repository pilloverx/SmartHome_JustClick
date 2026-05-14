# SmartHome_JustClick

**A self-contained Smart Home development environment using Docker, Home Assistant, and GitHub Codespaces.**

Automate your smart home with a local-first architecture. Control existing devices (Nest, Ring, Hue, Yale, Aqara) and prototype new hardware (ESP32, Raspberry Pi) in a single private Git repository.

---

## 📋 Quick Start

### Prerequisites
- GitHub account with Codespaces access (included with free tier)
- Docker installed locally (optional—pre-installed in Codespaces)

### Setup (5 minutes)

```bash
# 1. Clone or open in Codespaces
git clone https://github.com/yourusername/SmartHome_JustClick.git
cd SmartHome_JustClick

# 2. Start the stack
./scripts/start-dev.sh

# 3. Access Home Assistant
# Open http://localhost:8123 in your browser
```

**First startup takes 3-5 minutes.** Home Assistant initializes the database and loads integrations.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│     GitHub Codespaces / Local       │
├─────────────────────────────────────┤
│                                     │
│  ┌──────────────────────────────┐  │
│  │   Home Assistant (8123)       │  │
│  │   • Device integrations       │  │
│  │   • Automations               │  │
│  │   • UI dashboard              │  │
│  └──────────────────────────────┘  │
│           ↓ controls ↑              │
│  ┌──────────────────────────────┐  │
│  │  ESPHome (6052)              │  │
│  │  • ESP32 firmware compiler   │  │
│  │  • Local hardware prototypes │  │
│  └──────────────────────────────┘  │
│           ↓ compiles ↑              │
│  ┌──────────────────────────────┐  │
│  │  Your Devices                │  │
│  │  • Nest/Ecobee thermostats   │  │
│  │  • Ring doorbell             │  │
│  │  • Philips Hue lights        │  │
│  │  • Yale smart locks          │  │
│  │  • Aqara sensors             │  │
│  └──────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

**Communication methods:**
- **Cloud APIs** (Google, Amazon, Philips, etc.) for device control from Codespaces
- **MQTT** (optional) for local-first setups with home network bridge
- **Local protocols** (Zigbee, Z-Wave, Matter) via physical hub on home network

---

## 📁 Project Structure

```
SmartHome_JustClick/
├── README.md                          # This file
├── foundation.md                       # Detailed setup & architecture docs
├── docker-compose.yml                  # Docker services configuration
├── .devcontainer/
│   └── devcontainer.json              # GitHub Codespaces config
│
├── homeassistant/
│   ├── configuration.yaml             # HA main config
│   ├── automations.yaml               # Automation definitions
│   ├── scripts.yaml                   # Helper scripts
│   ├── scenes.yaml                    # Scene definitions
│   └── blueprints/                    # Reusable automation blueprints
│
├── esphome/
│   └── prototypes/                    # ESP32/ESP8266 device configs (.yaml)
│
├── openclaw-skills/
│   └── smart-home-core/               # AI skill definitions (future)
│       ├── SKILL.md
│       ├── tools.py
│       └── claw.json
│
├── docs/
│   ├── ARCHITECTURE.md                # Detailed architecture
│   ├── DEVICE-SETUP.md                # Per-device integration guides
│   ├── TROUBLESHOOTING.md             # Common issues & fixes
│   └── CLAWHUB-REFERENCE.md           # Original 7 markdown files
│
└── scripts/
    ├── start-dev.sh                   # Start Docker stack
    ├── recover.sh                     # Recovery/reset containers
    ├── docker-diagnostic.sh           # Check Docker status
    ├── install-tools.sh               # Install Docker + compose
    ├── restart-ha.sh                  # Restart Home Assistant
    ├── check-containers.sh            # View container logs
    └── TROUBLESHOOTING.md             # Script usage guide
```

---

## 🚀 Common Commands

### Start & Stop

```bash
# Start the entire stack
./scripts/start-dev.sh

# Stop all containers
docker-compose down

# Stop and remove volumes (WARNING: deletes data)
docker-compose down -v
```

### Monitor & Debug

```bash
# View live Home Assistant logs
docker logs -f homeassistant

# Check all container status
docker ps -a

# Full diagnostics
./scripts/docker-diagnostic.sh

# Container status & logs
./scripts/check-containers.sh
```

### Device Configuration

```bash
# Edit Home Assistant main config
nano homeassistant/configuration.yaml

# Add automation rules
nano homeassistant/automations.yaml

# Add ESPHome device
nano esphome/prototypes/my_device.yaml
```

### Recovery

```bash
# If containers won't start
./scripts/recover.sh

# Full system reset
docker-compose down -v && docker system prune -f && ./scripts/start-dev.sh
```

---

## 📱 Supported Devices

Home Assistant natively integrates with:

| Device | Protocol | Integration | Effort |
|--------|----------|-------------|--------|
| Nest Thermostat | Cloud API | Google | API key |
| Ecobee | Cloud API | Ecobee | API key |
| Ring Doorbell | Cloud API | Ring | Email/password |
| Philips Hue | Zigbee/Cloud | Hue | Bridge or credentials |
| Yale Smart Lock | Z-Wave/WiFi | Yale | Device pairing |
| Aqara Sensors | Zigbee | Aqara | Hub required |
| Custom ESP32 | Local WiFi | ESPHome | YAML config |

**Setup time:** Usually 5-15 minutes per device (get credentials, add integration, pair if needed).

---

## 🔧 Configuration Examples

### Add Nest Thermostat

```yaml
# homeassistant/configuration.yaml
nest:
  client_id: YOUR_GOOGLE_CLIENT_ID
  client_secret: YOUR_SECRET
```

Then restart: `docker-compose restart homeassistant`

### Create a Simple Automation

```yaml
# homeassistant/automations.yaml
- alias: "Good Morning"
  trigger:
    platform: time
    at: "07:00:00"
  condition:
    condition: time
    weekday: [mon, tue, wed, thu, fri]
  action:
    - service: light.turn_on
      entity_id: light.bedroom
      data:
        brightness: 50
    - service: climate.set_temperature
      entity_id: climate.thermostat
      data:
        temperature: 72
```

### Add ESP32 Device

```yaml
# esphome/prototypes/living_room_sensor.yaml
esphome:
  name: living_room_sensor
  
esp32:
  board: esp32dev

wifi:
  ssid: !secret wifi_ssid
  password: !secret wifi_password

sensor:
  - platform: dht
    pin: GPIO4
    temperature:
      name: "Living Room Temperature"
    humidity:
      name: "Living Room Humidity"
```

---

## 🌐 Access Points

| Service | URL | Purpose |
|---------|-----|---------|
| Home Assistant | http://localhost:8123 | Main dashboard & automation UI |
| ESPHome | http://localhost:6052 | Hardware compiler & device management |
| OpenClaw | http://localhost:8080 | AI skills (optional, currently disabled) |

---

## 🔐 Security & Privacy

✅ **Local-first by default**
- All automations run locally
- No external dependencies for core functions
- Devices control via cloud APIs (encrypted)

✅ **Credentials management**
- Never commit `.env` files or credentials
- Use Home Assistant secrets file: `homeassistant/secrets.yaml`
- All sensitive data stored in `.gitignore`

✅ **Network isolation** (when running on home network)
- Use separate VLAN for IoT devices
- Configure firewall rules in your router
- See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for details

---

## 📊 Resource Usage

**In GitHub Codespaces (free tier):**
- Container images: ~2-3 GB (one-time download)
- Runtime memory: <2 GB
- Disk usage: ~800 MB runtime data
- Total footprint: **Fits easily in free tier**

**Cost:** $0 if you stop Codespaces when done (Settings → Stop Codespace)

---

## 🛠️ Development Workflow

### For Automation Changes
```bash
# 1. Edit automations
nano homeassistant/automations.yaml

# 2. Restart HA to reload
docker-compose restart homeassistant

# 3. Test in dashboard
# http://localhost:8123 → Automations

# 4. Commit when working
git add homeassistant/automations.yaml
git commit -m "Add good morning routine"
git push
```

### For Device Prototypes
```bash
# 1. Write ESP32 config
nano esphome/prototypes/new_device.yaml

# 2. Connect your ESP32 via USB (local only)
./scripts/esphome-flash.sh new_device

# 3. Device appears in Home Assistant
# Verify in Integrations → ESPHome Devices
```

### For Cloud Codespaces Work
```bash
# 1. Stop containers when not using
docker-compose down

# 2. Commit your changes
git add -A
git commit -m "Work snapshot"
git push

# 3. Stop Codespace in GitHub
# Settings → Stop Codespace (saves hours)

# 4. Resume later
# Codespace will restart from your last state
```

---

## 🐛 Troubleshooting

**"Port 8123 shows 400 Bad Request"**
- Home Assistant is still initializing (first startup: 3-5 min)
- View logs: `docker logs -f homeassistant`
- Wait for "Setup passed" message

**"Port 8080 shows 502 Bad Gateway"**
- OpenClaw is currently disabled (optional feature)
- Home Assistant alone is fully functional
- Skip this port for now

**Permission errors with homeassistant/.storage/**
- Fix permissions: `sudo chown -R $USER:$USER homeassistant/.storage`
- Or skip from Git: Already in `.gitignore`

**Container won't start**
- Run diagnostics: `./scripts/docker-diagnostic.sh`
- Try recovery: `./scripts/recover.sh`
- Full reset: `docker-compose down -v && docker-compose up -d`

More help: [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [foundation.md](foundation.md) | Detailed architecture & design decisions |
| [docs/QUICK-START.md](docs/QUICK-START.md) | 5-minute setup walkthrough |
| [docs/LOCAL-RASPBERRY-PI.md](docs/LOCAL-RASPBERRY-PI.md) | **← Move to local/Raspberry Pi production** |
| [docs/DEVICE-SETUP.md](docs/DEVICE-SETUP.md) | Per-device integration guides |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Complete system architecture |
| [scripts/TROUBLESHOOTING.md](scripts/TROUBLESHOOTING.md) | Common issues & solutions |

---

## 🤝 Contributing

This is a personal smart home repo! But if you want to:

1. **Add a new device integration** → Create [docs/DEVICE-SETUP.md](docs/DEVICE-SETUP.md) section
2. **Improve automation** → Test locally, then commit
3. **Create reusable blueprint** → Save to `homeassistant/blueprints/`
4. **Build new hardware** → Add ESPHome config to `esphome/prototypes/`

---

## 📝 License

MIT License - See LICENSE file for details

---

## 🤖 Optional: AI-Powered Commands (Phase 3, Later)

**Coming in 1-3 months:** Natural language automation with OpenClaw + Ollama/llama.cpp

```
"Turn on bedroom and set temperature to 72"
  ↓
Local AI understands intent
  ↓
OpenClaw routes to Home Assistant
  ↓
Your devices respond
```

**Why add it later?** 
- YAML automations are powerful enough to start
- AI layer adds 20+ min setup
- Better to master basics first
- Zero cost when you add it

**See:** [docs/OPENCLAWINTEGRATION.md](docs/OPENCLAWINTEGRATION.md) for full AI integration guide (read in Phase 3)

---

1. **Start the stack:** `./scripts/start-dev.sh`
2. **Access Home Assistant:** http://localhost:8123
3. **Add your first device:** Settings → Devices & Services → Add Integration
4. **Create your first automation:** Automate tab → Create automation
5. **Stop when done:** `docker-compose down` or stop Codespace

---

## 📞 Support & Resources

- **Home Assistant Docs:** https://www.home-assistant.io/docs/
- **ESPHome Docs:** https://esphome.io/
- **Community Forums:** https://community.home-assistant.io/

---

**Last updated:** March 2026  
**Status:** Ready for development ✅