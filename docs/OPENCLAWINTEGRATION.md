# OpenClaw + LLM Integration Guide

**Adding AI-powered smart home automation with OpenClaw, llama.cpp, and Ollama.**

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│ User Interface Layer                                │
├─────────────────────────────────────────────────────┤
│                                                     │
│  "Turn on bedroom and play music at 50%"           │
│            ↓ (natural language)                     │
│                                                     │
├─────────────────────────────────────────────────────┤
│ AI Processing Layer (NEW)                           │
├─────────────────────────────────────────────────────┤
│                                                     │
│  OpenClaw (port 8080)                              │
│  ├─ Intent recognition                            │
│  ├─ Entity extraction                             │
│  └─ Service routing                               │
│            ↓                                        │
│  Ollama/llama.cpp (port 11434 or custom)          │
│  ├─ Local LLM processing                          │
│  ├─ Sentiment analysis                            │
│  └─ Context understanding                         │
│            ↓                                        │
│                                                     │
├─────────────────────────────────────────────────────┤
│ Home Assistant (port 8123)                          │
├─────────────────────────────────────────────────────┤
│ ├─ Converts AI intents → HA service calls          │
│ ├─ Automation execution                           │
│ └─ Device control                                 │
│            ↓                                        │
│ Your Smart Devices                                 │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## Phase 1-2: Current State (Development)

✅ **Right now (Codespaces + Local):**
- Home Assistant controls devices via cloud APIs
- YAML/UI-based automations
- Manual triggers

---

## Phase 3: Add AI Layer (1-3 months from now)

### What OpenClaw Does

OpenClaw is an **AI orchestration platform** that:
- Parses natural language commands
- Routes to appropriate Home Assistant services
- Maintains context across conversations
- Handles complex multi-step automations

### What llama.cpp/Ollama Does

**llama.cpp:** Lightweight C++ LLM inference
- Fast local reasoning
- Tiny models (1B, 3B parameters)
- Low memory footprint (500MB-2GB)

**Ollama:** Easy LLM management
- One-command setup
- Model library (Mistral, Llama2, Neural Chat)
- REST API (same as llama.cpp)

---

## When to Add: Timeline

| Phase | Timeline | Setup | What Happens |
|-------|----------|-------|--------------|
| **1** | Now | 5 min | Basic automation UI |
| **2** | 1-2 weeks | 10 min | YAML automations work |
| **3** | 1-3 months | 20 min | ← **Add AI layer here** |
| **4** | 3-6 months | 30 min | Full natural language |

**Don't add now.** Get comfortable with basic automations first. Add AI later.

---

## Future: How It Will Work Together

### Layer 1: Ollama/llama.cpp (LLM)

```bash
# Pull a small model (future)
ollama pull mistral  # or use llama2, neural-chat

# Running locally on your machine/Pi
# Accessible at: http://localhost:11434
```

### Layer 2: OpenClaw (Orchestration)

```bash
# Will be in docker-compose.yml (future)
docker run -d \
  --name openclaw \
  -p 8080:8080 \
  --link ollama \
  ghcr.io/openclaw/openclaw:latest
```

### Layer 3: Home Assistant Integration

```yaml
# homeassistant/automations.yaml (future)
- alias: "AI Voice Command"
  trigger:
    platform: webhook
    webhook_id: ai_command
  action:
    service_template: "{{ trigger.json.service }}"
    data_template: "{{ trigger.json.data }}"
```

### Complete Flow

```
User: "Turn on bedroom and set temperature to 72"
  ↓
Ollama/llama.cpp (parses intent)
  → Intent: "TURN_ON_DEVICE + SET_CLIMATE"
  → Entities: ["bedroom", "temperature", "72"]
  ↓
OpenClaw (routes to HA)
  → Converts to HA services
  → Calls: light.turn_on(entity_id: light.bedroom)
  → Calls: climate.set_temperature(target_temp: 72)
  ↓
Home Assistant (executes)
  ↓
Your Devices (respond)
```

---

## Commands for Later: Pull & Test

### Option A: Use Ollama (Easier)

```bash
# Install Ollama locally (when ready)
# Download from https://ollama.ai

# Pull a model (one command!)
ollama pull mistral

# Or use other models
ollama pull llama2
ollama pull neural-chat

# Run and test
ollama run mistral "What smart home devices can you control?"

# Access via API
curl http://localhost:11434/api/generate -d '{
  "model": "mistral",
  "prompt": "Turn on the bedroom light",
  "stream": false
}'
```

### Option B: Use llama.cpp (More Control)

```bash
# Clone llama.cpp
git clone https://github.com/ggerganov/llama.cpp.git 
cd llama.cpp

# Build
make

# Download a model (e.g., Mistral quantized)
wget https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.1-GGUF/resolve/main/Mistral-7B-Instruct-v0.1.Q4_0.gguf

# Run server
./server -m Mistral-7B-Instruct-v0.1.Q4_0.gguf -ngl 33

# Access at http://localhost:8000
```

### Option C: Docker (Recommended Later)

```bash
# Pull Ollama image
docker pull ollama/ollama

# Run Ollama
docker run -d \
  --name ollama \
  -p 11434:11434 \
  -v ollama:/root/.ollama \
  ollama/ollama

# Pull model inside container
docker exec ollama ollama pull mistral

# Or use GPU support (if available)
docker run -d \
  --gpus all \
  --name ollama \
  -p 11434:11434 \
  -v ollama:/root/.ollama \
  ollama/ollama
```

---

## Future: Updated docker-compose.yml

When you're ready (Phase 3), we'll add:

```yaml
version: '3.8'

services:
  homeassistant:
    image: ghcr.io/home-assistant/home-assistant:stable
    # ... existing config ...

  esphome:
    image: esphome/esphome:latest
    # ... existing config ...

  # ADD THIS LATER (Phase 3)
  ollama:
    image: ollama/ollama:latest
    container_name: ollama
    restart: always
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
    environment:
      - OLLAMA_MODELS=/root/.ollama/models
    # Optional: GPU support
    # deploy:
    #   resources:
    #     reservations:
    #       devices:
    #         - driver: nvidia
    #           count: 1
    #           capabilities: [gpu]

  # ADD THIS LATER (Phase 3)
  openclaw:
    image: ghcr.io/openclaw/openclaw:latest
    container_name: openclaw
    restart: always
    ports:
      - "8080:8080"
    depends_on:
      - homeassistant
      - ollama
    environment:
      - HA_URL=http://homeassistant:8123
      - HA_TOKEN=${HA_TOKEN}
      - OLLAMA_URL=http://ollama:11434
      - OLLAMA_MODEL=mistral
    network_mode: bridge

volumes:
  ollama_data:
```

---

## Future: Integration Steps (Phase 3)

When ready to integrate, follow this checklist:

### Step 1: Pull Models

```bash
# If using Ollama
docker exec ollama ollama pull mistral    # ~4GB
# OR
docker exec ollama ollama pull neural-chat  # ~5GB
# OR smaller
docker exec ollama ollama pull orca-mini   # ~1.5GB
```

### Step 2: Test Ollama

```bash
# Test connection
curl http://localhost:11434/api/generate \
  -d '{"model":"mistral","prompt":"hello","stream":false}'

# Expected response
{
  "response": "Hello! How can I help you today?",
  "done": true
}
```

### Step 3: Deploy OpenClaw

```bash
# Add to docker-compose.yml (see above)
docker-compose up -d openclaw

# Check logs
docker logs -f openclaw

# Access dashboard
# http://localhost:8080
```

### Step 4: Get Home Assistant Token

```bash
# In Home Assistant
# Settings → Developer Tools → Long-Lived Access Tokens
# Create a token

# Set environment variable
export HA_TOKEN="eyJhbGciOiJIUzI1NiIsInR5..."

# Or add to .env file
echo "HA_TOKEN=eyJhbGciOiJIUzI1NiIsInR5..." > .env
```

### Step 5: Configure OpenClaw

```bash
# Access OpenClaw UI
http://localhost:8080

# Settings:
# - Home Assistant URL: http://homeassistant:8123
# - HA Token: (paste from step 4)
# - LLM URL: http://ollama:11434
# - LLM Model: mistral
# - Save
```

### Step 6: Test End-to-End

```bash
# In OpenClaw UI or via API
curl -X POST http://localhost:8080/api/command \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Turn on the living room light"
  }'

# Expected: Light turns on in Home Assistant
```

---

## Model Recommendations by Phase

### Phase 2 (Now): None
- Use YAML automations only
- No LLM needed

### Phase 3 (1-3 months): Pick One

| Model | Size | Speed | Accuracy | Use Case |
|-------|------|-------|----------|----------|
| Orca-Mini | 1.5GB | ⚡⚡⚡ | ⭐⭐⭐⭐ | Lightweight (Pi) |
| Mistral | 4-7GB | ⚡⚡ | ⭐⭐⭐⭐⭐ | Best balance |
| Llama2-Chat | 7-13GB | ⚡⚡ | ⭐⭐⭐⭐⭐ | Most reliable |
| Neural-Chat | 5GB | ⚡⚡ | ⭐⭐⭐⭐ | Good for chat |

**Recommendation:** Start with **Mistral** (4GB)

```bash
ollama pull mistral
# Fast, accurate, good balance
```

---

## Architecture Decision: Why Three Layers?

### Layer 1: Ollama/llama.cpp (LLM)
- **Purpose:** Pure language understanding
- **Why separate:** Can be on different machine, GPU support
- **Cost:** Free, open-source

### Layer 2: OpenClaw (Orchestration)
- **Purpose:** Convert intent → HA service calls
- **Why separate:** Handles routing, caching, fallbacks
- **Cost:** Free, open-source

### Layer 3: Home Assistant (Execution)
- **Purpose:** Actually control devices
- **Why separate:** Already have it, proven stable
- **Cost:** Free, open-source

**Benefit:** Each layer is independently upgradeable!

---

## Roadmap: Adding to Your Setup

### Today (Now)
```
✅ Home Assistant (basic)
✅ ESPHome (hardware)
✅ Git control
```

### Week 1-2
```
✅ YAML automations
✅ Device integrations
✅ Blueprints
```

### Month 1-2
```
🔲 Test Ollama locally
🔲 Experiment with models
🔲 Write OpenClaw config
```

### Month 2-3
```
🔲 Deploy to Raspberry Pi
🔲 Integrate with HA
🔲 Test voice commands
```

### Month 3-6
```
🔲 Advanced automations
🔲 Context awareness
🔲 Multi-device orchestration
```

---

## Future File Structure (Phase 3+)

```
SmartHome_JustClick/
├── docker-compose.yml          ← Updated with llama + openclaw
│
├── homeassistant/
│   ├── configuration.yaml
│   └── automations.yaml        ← Will add AI-triggered automations
│
├── openclaw/                   ← NEW FOLDER
│   ├── config.yaml            ← OpenClaw settings
│   ├── intents/               ← Intent definitions
│   │   ├── lighting.yaml
│   │   ├── climate.yaml
│   │   └── security.yaml
│   └── skills/                ← Custom AI skills
│
├── models/                    ← NEW FOLDER (optional)
│   └── mistral-7b.gguf       ← Downloaded LLM weights
│
└── docs/
    └── OPENCLAWINTEGRATION.md  ← NEW: Full integration guide
```

---

## Resource Requirements (When You Add It)

| Component | CPU | RAM | Disk | GPU Optional? |
|-----------|-----|-----|------|---------------|
| Ollama (small) | 2 cores | 2GB min | 2-4GB | Yes |
| Ollama (large) | 4 cores | 4GB min | 7-13GB | Yes |
| OpenClaw | 1 core | 512MB | 100MB | No |
| Total (Pi 4) | ✅ OK | ✅ OK (2GB Pi) | ⚠️ Tight (4GB Pi) | ✅ Possible |

**Bottleneck:** Model size. Raspberry Pi 4 with 2GB can run orca-mini, but struggles with Mistral.

**Solution:** Use smaller model, or upgrade to Pi 5 (8GB).

---

## Testing Commands (For Later)

### Test Ollama Alone

```bash
# Start Ollama
docker run -d -p 11434:11434 ollama/ollama
docker exec ollama ollama pull mistral

# Test basic generation
curl http://localhost:11434/api/generate \
  -d '{"model":"mistral","prompt":"What can you help with?","stream":false}' \
  | jq .

# Test embeddings (for similarity search)
curl http://localhost:11434/api/embeddings \
  -d '{"model":"mistral","prompt":"Turn on the lights"}'
```

### Test OpenClaw Alone

```bash
# Start OpenClaw (see docker-compose)
docker-compose up openclaw

# View logs
docker logs -f openclaw

# Test API
curl http://localhost:8080/api/status
```

### Test Full Integration

```bash
# All three running
docker-compose up -d

# Send command
curl -X POST http://localhost:8080/api/command \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Turn on bedroom light",
    "user": "admin"
  }'

# Check Home Assistant
# http://localhost:8123
# → Light should be on!
```

---

## Troubleshooting (Future Reference)

### Ollama Won't Pull Models

```bash
# Check internet
ping huggingface.co

# Manual download + load
wget https://huggingface.co/...
ollama create mistral -f Modelfile
```

### OpenClaw Can't Reach Home Assistant

```bash
# Check network
docker network inspect bridge

# Verify HA is accessible
docker exec openclaw curl http://homeassistant:8123

# Check token
docker logs openclaw | grep -i token
```

### Slow Response Times

- Switch to smaller model (orca-mini)
- Enable GPU support (NVIDIA)
- Reduce model context window
- Use inference caching

### High Memory Usage

- Run Ollama on different machine
- Use quantized models (Q4_0, Q5_K)
- Reduce batch size
- Monitor with `docker stats`

---

## Cost Analysis: Adding AI Layer

| Item | Cost | Notes |
|------|------|-------|
| **Ollama** | $0 | Free, open-source |
| **llama.cpp** | $0 | Free, open-source |
| **OpenClaw** | $0 | Free, open-source |
| **Models** | $0 | Free (7B-13B weights) |
| **GPU (optional)** | $200-500 | One-time, not required |
| **Storage (models)** | $0 | Already have disk |
| ****Total AI addition** | **$0-500** | **Optional hardware only** |

**Bottom line:** AI layer costs nothing. Optional GPU is nice but not needed.

---

## Summary: When & How

### Right Now (Phase 1-2)
- ✅ Start with YAML automations
- ✅ Get comfortable with Home Assistant
- ✅ No AI needed yet
- 📍 You are here

### In 1-3 Months (Phase 3)
- 🔲 Revisit this guide
- 🔲 Pull Ollama/llama.cpp
- 🔲 Test models locally
- 🔲 Deploy to Raspberry Pi

### Later (Phase 4+)
- 🔲 Full natural language commands
- 🔲 Context-aware automation
- 🔲 Multi-device orchestration

---

## Quick Reference: Future Commands

```bash
# LATER: Pull Ollama
docker pull ollama/ollama

# LATER: Pull a model
docker run ollama/ollama ollama pull mistral

# LATER: Test generation
curl http://localhost:11434/api/generate \
  -d '{"model":"mistral","prompt":"hello","stream":false}'

# LATER: Add to compose
# (See docker-compose.yml example above)

# LATER: Deploy OpenClaw
docker-compose up openclaw

# LATER: Test end-to-end
curl -X POST http://localhost:8080/api/command \
  -d '{"text":"Turn on lights"}'
```

---

## Learn More (Future Reading)

- **Ollama Docs:** https://github.com/ollama/ollama
- **llama.cpp:** https://github.com/ggerganov/llama.cpp
- **OpenClaw:** https://github.com/openclaw/openclaw
- **Home Assistant Webhooks:** https://www.home-assistant.io/docs/automation/trigger/#webhook-trigger
- **LLM Benchmarks:** https://huggingface.co/spaces/HuggingFaceH4/open_llm_leaderboard

---

## Next Steps

1. **Don't add now** - Focus on basic automations first
2. **Get comfortable** with Home Assistant (1-2 weeks)
3. **Then come back** to this guide
4. **Start with Ollama** (easier than llama.cpp)
5. **Test locally** before deploying to Pi

---

**Status:** 🔲 Not implemented yet (comes in Phase 3)  
**Readiness:** ✅ Architecture ready, documentation complete  
**Next action:** Use basic automations for 1-3 months, then revisit this

---

**See also:** [LOCAL-RASPBERRY-PI.md](LOCAL-RASPBERRY-PI.md) for where to run this layer
