# Foundation: Smart Home Architecture & Design

**Version 1.0.0 | March 2026**

This document describes the architectural decisions, constraints, and rationale for SmartHome_JustClick.

---

## Vision

A unified smart home platform that:
- Controls existing commercial devices (Nest, Ring, Hue, Yale, Aqara)
- Supports modular hardware prototypes (ESP32, Raspberry Pi)
- Runs entirely locally (automations, logic)
- Uses cloud APIs only for device communication (when unavoidable)
- Evolves from solo development to team collaboration without architectural changes

---

## Core Principles

### 1. Local-First Automations
All automation logic executes locally, ensuring continued operation during internet outages.

```
Device Events (local) → Home Assistant (local) → Automations (local) → Commands (local/cloud)
```

### 2. Minimal Cloud Dependency
Devices may communicate through cloud APIs, but control logic never depends on cloud services.

| Layer | Location | Fallback |
|-------|----------|----------|
| Devices | Home network (WiFi/Zigbee/Z-Wave) | Cloud APIs |
| Automations | Local HA instance | YAML-based fallback |
| Storage | Local database | File-based config |

### 3. Protocol Flexibility
Use the best protocol for each device's use case:

| Protocol | Use Case | Range | Mesh | Power |
|----------|----------|-------|------|-------|
| Matter | Future-proof new devices | Good | Yes | Varies |
| Zigbee | Sensors, buttons, lights | Good | Yes | Battery-friendly |
| Z-Wave | Switches, locks, critical devices | Better | Yes | Efficient |
| WiFi | Cameras, heavy bandwidth | Good | No | Power-hungry |
| Local ESPHome | Prototypes, custom hardware | Local | No | Configurable |

---

## Architecture

### System Layers

```
┌───────────────────────────────────────────────────────┐
│ User Interface Layer                                  │
│ • Home Assistant Dashboard (http://localhost:8123)    │
│ • Mobile app (via cloud relay or local access)       │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│ Automation & Logic Layer                             │
│ • YAML automations (condition-based)                │
│ • Python scripts (complex logic)                    │
│ • Blueprints (reusable patterns)                    │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│ Device Integration Layer                             │
│ • Home Assistant native integrations                │
│ • MQTT for local bridging                           │
│ • Cloud API connectors                              │
│ • Local protocol adapters (Zigbee, Z-Wave)          │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│ Hardware & Device Layer                              │
│ • Commercial devices (Nest, Ring, Hue, etc.)        │
│ • Modular prototypes (ESP32, Raspberry Pi)          │
│ • Protocol hubs (Zigbee, Z-Wave, Matter)            │
└───────────────────────────────────────────────────────┘
```

### Deployment Architecture

**Development (Codespaces):**
```
GitHub Codespaces (Cloud)
├── Home Assistant Container
├── ESPHome Compiler
└── Automation Environment
     ↓ accesses via Cloud APIs ↓
Home Devices (local network)
```

**Production (Recommended):**
```
Raspberry Pi (Home Network)
├── Home Assistant (native or container)
├── Zigbee/Z-Wave Hub (optional add-on)
├── Local SSH access
└── Auto-synced from GitHub
```

---

## Technology Stack

### Core Components

| Component | Choice | Rationale | Resource Use |
|-----------|--------|-----------|--------------|
| Orchestration | Docker Compose | Works in Codespaces, production-ready | — |
| Automation Hub | Home Assistant | Largest device support, active community | 1.5 GB RAM |
| Hardware Compiler | ESPHome | Quick iteration, local compilation | 250 MB |
| Database | SQLite (HA default) | Zero-config, embedded | 50-200 MB |
| UI | Home Assistant Web | Beautiful, no extra install | Included |

### Optional Add-ons

| Component | Purpose | When To Add |
|-----------|---------|------------|
| MQTT Broker | Local device bridging | When using local protocols |
| llama.cpp | Local LLM for AI commands | Phase 2+ only |
| OpenClaw | AI skill orchestration | Phase 3+ only |
| MariaDB | Advanced analytics | Later, if needed |

---

## File Organization

### Purpose of Each Directory

```
homeassistant/
├── configuration.yaml      # Main settings, integrations
├── automations.yaml        # Trigger-based rules
├── scripts.yaml            # Helper functions
├── scenes.yaml             # Preset state combinations
├── blueprints/             # Reusable automation templates
└── .storage/               # ✗ NEVER COMMIT (auth, cache)

esphome/
└── prototypes/             # Your ESP32/ESP8266 configs

openclaw-skills/
└── smart-home-core/        # AI skill definitions (future)

docs/
├── ARCHITECTURE.md         # This section expanded
├── DEVICE-SETUP.md         # Per-device guides
├── TROUBLESHOOTING.md      # Common issues
└── CLAWHUB-REFERENCE.md    # Original 7 markdown files

scripts/
├── start-dev.sh            # Standard startup
├── recover.sh              # Emergency recovery
└── docker-diagnostic.sh    # System diagnostics
```

### What Gets Committed to Git

✅ **Always commit:**
- `homeassistant/configuration.yaml` (sanitized)
- `homeassistant/automations.yaml`
- `homeassistant/blueprints/*`
- `esphome/prototypes/*.yaml`
- `docs/*.md`
- `.devcontainer/devcontainer.json`
- `docker-compose.yml`

❌ **Never commit:**
- `.storage/` (auth tokens, temp cache)
- `.cloud/` (cloud account data)
- `*.db` files (database)
- `.env` or `secrets.yaml`
- Logs, temporary files

---

## Device Integration Patterns

### Pattern 1: Cloud API Integration (Easiest)

```yaml
# homeassistant/configuration.yaml
google_home:
  expose_by_default: false

nest:
  client_id: !secret nest_client_id
  client_secret: !secret nest_client_secret
```

**Pros:** Simple, minimal local equipment  
**Cons:** Depends on cloud service, Internet required

### Pattern 2: Local Protocol via Hub (Recommended)

Device → [Zigbee/Z-Wave Hub] → Home Assistant (local)

```yaml
# homeassistant/configuration.yaml
zha:  # Zigbee Home Automation
  device_path: /dev/ttyUSB0
  database_path: /config/zha.db
```

**Pros:** Fast, reliable, works offline  
**Cons:** Requires hub hardware

### Pattern 3: MQTT Bridge (Most Flexible)

Device → [MQTT Broker] ← → Home Assistant

```yaml
# homeassistant/configuration.yaml
mqtt:
  broker: localhost
  port: 1883
  username: ha_user
  password: !secret mqtt_password
```

**Pros:** Decoupled, scalable, private  
**Cons:** Extra infrastructure

### Pattern 4: Local WiFi (ESPHome Only)

ESP32 → WiFi → Home Assistant

```yaml
# esphome/prototypes/sensor.yaml
esphome:
  name: living_room_sensor

esp32:
  board: esp32dev

wifi:
  ssid: !secret wifi_ssid
  password: !secret wifi_password
```

**Pros:** Flexible, low cost  
**Cons:** Custom development needed

---

## Scaling Strategy

### Phase 1: Foundation (You Are Here)
- Single Home Assistant instance
- Cloud API integrations for existing devices
- Basic YAML automations
- Git-based version control

### Phase 2: Local Hardware
- Raspberry Pi running Home Assistant (persistent)
- Zigbee/Z-Wave hub for local control
- MQTT broker for bridging
- Automated Git sync

### Phase 3: Advanced Automation
- Python-based complex logic
- Custom ESPHome hardware prototypes
- Integration with OpenClaw for AI commands

### Phase 4: Team Collaboration
- Multiple contributors to same repo
- Separate branches for automations
- Shared blueprint library
- Documented device integrations

---

## Cost Analysis

### GitHub Codespaces (Development)
- **Free tier:** 60 hours/month, 15 GB storage
- **Cost with spending limit:** $0 (stop containers when done)
- **Suitable for:** Part-time development, prototyping

### Raspberry Pi 5 (Production)
- **One-time cost:** $60-80 USD
- **Annual cost:** $0 (power usage negligible)
- **Suitable for:** 24/7 home automation

### Cloud APIs (Devices)
- **Most devices:** Free (included with purchase)
- **Premium analytics:** $5-20/month per service
- **DIY alternative:** Run MQTT broker + local protocols

---

## Security Considerations

### Authentication
- Home Assistant: Self-hosted, no central credentials needed
- Devices: Use manufacturer authentication (OAuth, API keys)
- Storage: Credentials in `secrets.yaml`, never committed to Git

### Network Isolation
When running on home network:
1. Create separate IoT VLAN for devices
2. Configure firewall rules (IoT → WAN allowed, IoT → LAN blocked)
3. Access HA via VPN if remote

### Data Privacy
- All automation logs stored locally
- Database is SQLite, on your device
- No telemetry sent to Home Assistant project
- Optional: Air-gap (no internet) for critical systems

---

## Future Roadmap

| Milestone | Timeline | Features |
|-----------|----------|----------|
| **v1.0** | Now | Basic device control + automations |
| **v1.1** | Q2 2026 | Local Zigbee hub support |
| **v2.0** | Q3 2026 | AI skills (OpenClaw + Ollama/llama.cpp) |
| **v2.1** | Q4 2026 | Multi-user support + team workflows |
| **v3.0** | 2027 | Full Matter protocol support |

---

## Phase 3: AI Integration (Future)

When you're ready (1-3 months from now), you'll add an optional AI layer:

```
User: "Turn on bedroom and set temperature to 72"
  ↓
Ollama/llama.cpp (natural language → intent)
  ↓
OpenClaw (intent → Home Assistant services)
  ↓
Home Assistant (service execution)
  ↓
Your Devices (respond to commands)
```

**Why separate from current setup?**
- Don't need AI to start - basic automations are powerful
- Each component independently upgradeable
- Can add locally on Raspberry Pi later
- Zero cost (all open-source)

**See:** [docs/OPENCLAWINTEGRATION.md](../docs/OPENCLAWINTEGRATION.md) for complete AI setup guide (read later)

---

## Architecture Decision Records (ADRs)

### ADR-001: Docker-First Development
**Decision:** Use Docker Compose for local development  
**Rationale:** Works identically in Codespaces, laptop, Raspberry Pi  
**Trade-off:** Slightly higher learning curve vs. native installation

### ADR-002: Home Assistant as Orchestrator
**Decision:** Home Assistant as single source of truth  
**Rationale:** Largest device support, active development, proven in production  
**Trade-off:** Vendor lock-in (mitigated by open-source)

### ADR-003: YAML-First Automations
**Decision:** Prioritize YAML over UI automations  
**Rationale:** Version control, reproducible, infrastructure-as-code  
**Trade-off:** Steeper learning curve for non-technical users

### ADR-004: Cloud APIs When Necessary
**Decision:** Use cloud APIs for device communication  
**Rationale:** Simplicity, no local hub hardware required initially  
**Trade-off:** Internet dependency, privacy concerns (mitigated by transition plan)

---

## References

- **Home Assistant Documentation:** https://www.home-assistant.io/docs/
- **ESPHome Documentation:** https://esphome.io/
- **Docker Compose Documentation:** https://docs.docker.com/compose/
- **GitHub Codespaces Guide:** https://docs.github.com/en/codespaces
- **Smart Home Best Practices:** https://community.home-assistant.io/

---

## Questions or Feedback?

See [README.md](README.md) for support resources.

---

**Last updated:** March 2026  
**Maintainer:** SmartHome_JustClick contributors
    volumes:
      - ./homeassistant:/config
    ports:
      - "8123:8123"
    restart: unless-stopped

  openclaw:
    image: ghcr.io/openclaw/openclaw:latest   # or use python base if image heavy
    volumes:
      - ./openclaw-skills:/skills
    ports:
      - "8080:8080"
    depends_on:
      - homeassistant

  esphome:
    image: esphome/esphome
    volumes:
      - ./esphome:/config
    ports:
      - "6052:6052"
EOF

# Create start script
cat > scripts/start-dev.sh << 'EOF'
#!/bin/bash
docker compose up -d
echo "✅ Stack running!"
echo "HA: http://localhost:8123"
echo "OpenClaw: http://localhost:8080"
echo "ESPHome: http://localhost:6052"
EOF
chmod +x scripts/start-dev.sh

echo "Foundation files created. Next: copy your 7 Markdown files into openclaw-skills/smart-home-core/"
```

4. **Copy your original 7 Markdown files**  
   Paste them into `openclaw-skills/smart-home-core/` (rename the overview one to `SKILL.md`).

5. **Commit & push**
```bash
git add .
git commit -m "Initial foundation setup – solo free Codespaces edition"
git push
```

### First Actions After Setup (Do These Now)
1. Run `./scripts/start-dev.sh`
2. Open http://localhost:8123 → finish HA onboarding (use "Advanced" mode)
3. Paste your Markdown content into `docs/CLAWHUB-REFERENCE.md`
4. Create your first skill stub: `openclaw-skills/smart-home-core/tools.py` (I will generate it in next message if you say “next”)

### Solo Workflow (How You Work Daily)
- Open Codespaces → `./scripts/start-dev.sh`
- Edit skills in `openclaw-skills/` or hardware in `esphome/`
- Test instantly in HA dashboard
- When done: Stop codespace + commit
- Repeat. This pattern scales to a real team later without changes.

---
It slots perfectly after the “Solo Workflow” section.
Markdown### ClawHub Publishing Pipeline (Built-in & One-Command)

**Goal:** Turn any folder inside `openclaw-skills/` into a live, installable skill on https://clawhub.ai in <60 seconds.

#### Why This Works Perfectly
- Our `smart-home-core/` folder = exact ClawHub skill format
- HA + ESPHome parts stay private (only skills get published)
- You stay solo → later teams add more folders → each can be published separately

#### Add This to Your Foundation (Run Once)

```bash
# Inside Codespaces terminal
npm install -g @clawhub/cli   # or use npx clawhub@latest (lighter for free tier)

# Create claw.json metadata (auto-generated)
cat > openclaw-skills/smart-home-core/claw.json << EOF
{
  "ownerId": "$(whoami)-solo",
  "slug": "smart-home-pro",
  "version": "1.0.0",
  "publishedAt": "$(date +%s)"
}
EOF
Publishing Commands (Add These to scripts/publish-to-clawhub.sh later)
Bash# 1. Quick publish the core skill (instruction + executable)
npx clawhub@latest publish ./openclaw-skills/smart-home-core \
  --slug smart-home-pro \
  --name "Smart Home Pro – Local-First + ESPHome" \
  --version 1.0.0 \
  --description "Full automation skill for existing devices + new modular hardware" \
  --changelog "Initial release from GitHub Codespaces foundation"

# 2. Update existing skill (after you improve it)
npx clawhub@latest publish ./openclaw-skills/smart-home-core --update

# 3. Publish a new sub-skill (e.g. renter-only)
npx clawhub@latest publish ./openclaw-skills/renter-automation --slug renter-safe
Security & Best-Practice Checklist (from ClawHub 2026 guidelines)

Never include real credentials or .env
All tools.py must sanitize inputs
Add VirusTotal link after publish (auto-provided)
Homepage field → link to this GitHub repo

Future-Proof Bonus
When you have a real team, each person can publish their own skill from the same repo (different folders).
Later you can also submit a PR to the official openclaw/skills GitHub repo for even more visibility.
This means whatever we build here can instantly sbecome a ClawHub skill — exactly like the original one you started with, but now powerful and executable

**You are ready.**  

