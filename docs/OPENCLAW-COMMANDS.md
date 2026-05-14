# AI Layer: Commands Cheat Sheet

**Quick reference for pulling, testing, and deploying Ollama/llama.cpp/OpenClaw.**

📌 **Use this when you're ready to add AI (Phase 3, in 1-3 months)**

---

## Quick Start: Ollama (Recommended)

### 1. Pull Ollama Image

```bash
docker pull ollama/ollama
```

### 2. Run Ollama

```bash
docker run -d \
  --name ollama \
  -p 11434:11434 \
  -v ollama_data:/root/.ollama \
  ollama/ollama
```

### 3. Pull a Model

```bash
# Small & fast (1.5GB) - for Raspberry Pi
docker exec ollama ollama pull orca-mini

# Recommended (4-7GB) - best balance
docker exec ollama ollama pull mistral

# Most capable (7-13GB) - needs good hardware
docker exec ollama ollama pull llama2-chat
```

### 4. Test Generation

```bash
curl http://localhost:11434/api/generate \
  -d '{
    "model": "mistral",
    "prompt": "What smart home devices can you control?",
    "stream": false
  }' | jq .


# Or run interactively
docker exec -it ollama ollama run mistral
```

---

## Alternative: llama.cpp (More Control)

### 1. Clone Repository

```bash
git clone https://github.com/ggerganov/llama.cpp.git
cd llama.cpp
make
```

### 2. Download Model

```bash
# Mistral quantized (4GB)
wget https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.1-GGUF/resolve/main/Mistral-7B-Instruct-v0.1.Q4_0.gguf

# Or Llama2
wget https://huggingface.co/TheBloke/Llama-2-7B-Chat-GGUF/resolve/main/llama-2-7b-chat.Q4_0.gguf
```

### 3. Run Server

```bash
./server -m Mistral-7B-Instruct-v0.1.Q4_0.gguf \
  -c 2048 \
  -ngl 33 \
  --host 0.0.0.0 \
  --port 8000
```

Access at: `http://localhost:8000`

---

## Integrating Into docker-compose.yml

### Add Ollama Service

```yaml
services:
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

  # Then pull model once:
  # docker exec ollama ollama pull mistral
```

### Add OpenClaw Service

```yaml
services:
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
      - LOG_LEVEL=INFO
```

### Start Everything

```bash
# Restart with new services
docker-compose down
docker-compose up -d

# Pull model
docker exec ollama ollama pull mistral

# Check status
docker-compose ps
```

---

## Testing The Chain

### 1. Test Ollama Alone

```bash
curl http://localhost:11434/api/generate \
  -d '{"model":"mistral","prompt":"hello","stream":false}'
```

### 2. Test OpenClaw Alone

```bash
curl http://localhost:8080/api/status

# Expected: OK response
```

### 3. Test Full Integration

```bash
curl -X POST http://localhost:8080/api/command \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Turn on the living room light",
    "user": "admin"
  }'

# Check Home Assistant - light should turn on!
```

---

## Model Sizes & Performance

```
orca-mini (1.5GB)
├─ Inference: 1-2 sec
├─ Memory: 1GB active
└─ Best for: Raspberry Pi 2GB

mistral (4GB)
├─ Inference: 2-3 sec
├─ Memory: 2-3GB active
└─ Best for: Raspberry Pi 4GB, laptops

llama2-chat (13GB)
├─ Inference: 3-5 sec
├─ Memory: 4-6GB active
└─ Best for: Desktop, good GPU

llama2 (13GB)
├─ Inference: 4-6 sec
├─ Memory: 5-7GB active
└─ Best for: Server, powerful machine
```

---

## Model Download Links

| Model | Size | Download |
|-------|------|----------|
| Orca-Mini | 1.5GB | `ollama pull orca-mini` |
| Mistral | 4-7GB | `ollama pull mistral` |
| Llama2-Chat | 7-13GB | `ollama pull llama2-chat` |
| Neural-Chat | 5GB | `ollama pull neural-chat` |
| Dolphin-Mixtral | 26GB | `ollama pull dolphin-mixtral` |

**Recommended to start:** `mistral`

---

## Common Tasks

### List Downloaded Models

```bash
docker exec ollama ollama list
# or
curl http://localhost:11434/api/tags
```

### Delete a Model

```bash
docker exec ollama ollama rm mistral
```

### Update to Latest

```bash
docker pull ollama/ollama
docker-compose up -d ollama
```

### Check Resource Usage

```bash
docker stats ollama
```

### View Logs

```bash
docker logs -f ollama
docker logs -f openclaw
```

---

## GPU Support (Optional)

### NVIDIA GPU

```bash
docker run -d \
  --gpus all \
  --name ollama \
  -p 11434:11434 \
  -v ollama_data:/root/.ollama \
  ollama/ollama
```

Or in compose:

```yaml
ollama:
  deploy:
    resources:
      reservations:
        devices:
          - driver: nvidia
            count: 1
            capabilities: [gpu]
```

### AMD GPU

```bash
# Requires ROCm drivers
docker run -d \
  --device /dev/kfd \
  --device /dev/dri \
  --group-add video \
  --name ollama \
  -p 11434:11434 \
  -v ollama_data:/root/.ollama \
  ollama/ollama:latest-rocm
```

---

## Troubleshooting

### Model Download Stuck

```bash
# Check internet
ping huggingface.co

# Try again
docker exec ollama ollama pull mistral
```

### Out of Memory

```bash
# Switch to smaller model
docker exec ollama ollama pull orca-mini

# Or increase swap
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### Slow Response

```bash
# Try different model
ollama pull neural-chat

# Reduce context window (in OpenClaw config)
# Or enable GPU support
```

### Can't Connect

```bash
# Check if running
docker ps | grep ollama

# Check logs
docker logs ollama

# Test locally
curl http://localhost:11434/api/tags
```

---

## API Endpoints (For Scripting Later)

### Generate Text

```bash
POST /api/generate
{
  "model": "mistral",
  "prompt": "Hello",
  "stream": false
}
```

### Get Embeddings

```bash
POST /api/embeddings
{
  "model": "mistral",
  "prompt": "Turn on the lights"
}
```

### List Models

```bash
GET /api/tags
```

### Pull Model

```bash
POST /api/pull
{
  "name": "mistral"
}
```

---

## Sample Home Assistant Automation (Future)

```yaml
# Will work with OpenClaw + Ollama

automation:
  - alias: "AI Voice Command"
    trigger:
      webhook_id: ai_command
    action:
      service_template: "{{ trigger.json.service }}"
      data_template: "{{ trigger.json.data }}"

  - alias: "AI Response"
    trigger:
      platform: time_pattern
      seconds: 0
    condition:
      - condition: template
        value_template: "{{ states('input_boolean.ai_active') == 'on' }}"
    action:
      - service: tts.google_translate_say
        data_template:
          entity_id: media_player.kitchen_speaker
          message: "{{ states('input_text.ai_response') }}"
```

---

## Phase 3 Checklist

- [ ] Read [OPENCLAWINTEGRATION.md](../docs/OPENCLAWINTEGRATION.md)
- [ ] Have basic automations working (Phase 1-2)
- [ ] Pull Ollama: `docker pull ollama/ollama`
- [ ] Test locally: `docker run ollama/ollama`
- [ ] Choose model: `ollama pull mistral`
- [ ] Test generation: `curl http://localhost:11434/...`
- [ ] Update docker-compose.yml
- [ ] Add OpenClaw service
- [ ] Deploy: `docker-compose up -d`
- [ ] Get HA token: Settings → Developer Tools → Long-Lived Access Token
- [ ] Configure OpenClaw with HA credentials
- [ ] Test end-to-end command

---

## When Ready

1. Copy commands from this sheet
2. Refer to [OPENCLAWINTEGRATION.md](../docs/OPENCLAWINTEGRATION.md) for details
3. Test locally first
4. Deploy to Raspberry Pi
5. Track changes in git

---

## Resources

- **Ollama:** https://github.com/ollama/ollama
- **llama.cpp:** https://github.com/ggerganov/llama.cpp
- **OpenClaw:** https://github.com/openclaw/openclaw
- **HuggingFace Models:** https://huggingface.co/models

---

**Start using this when:** You're comfortable with basic automations (1-3 months from now)

**Bookmark this file** - You'll reference it in Phase 3!
