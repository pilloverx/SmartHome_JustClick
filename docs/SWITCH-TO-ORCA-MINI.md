# Switching from Mistral to Orca-Mini + Resource Assessment

**Date:** March 2026  
**Purpose:** Move from large model (Mistral 7GB) to lightweight model (Orca-Mini 1.5GB)

---

## Quick Commands to Switch Models

### Step 1: Remove Mistral Model

```bash
# Check what models are installed
docker exec ollama ollama list

# Remove mistral to free up space
docker exec ollama ollama rm mistral

# Verify removal
docker exec ollama ollama list
```

### Step 2: Pull Orca-Mini Instead

```bash
# Pull the lightweight model
docker exec ollama ollama pull orca-mini

# Test it works
docker exec -it ollama ollama run orca-mini

# Or test via API
curl http://localhost:11434/api/generate \
  -d '{"model":"orca-mini","prompt":"hello","stream":false}'
```

### Step 3: Update docker-compose.yml

Change the OLLAMA_MODEL environment variable:

```yaml
# Before:
- OLLAMA_MODEL=mistral

# After:
- OLLAMA_MODEL=orca-mini
```

### Step 4: Restart Ollama

```bash
docker-compose restart ollama

# Verify
docker ps | grep ollama
```

---

## Resource Assessment Commands

Run these to see your current resource usage:

### Disk Space

```bash
# Overall filesystem
df -h /workspaces

# Specific to this project
du -sh /workspaces/SmartHome_JustClick

# Docker volumes
docker volume ls

# Individual container sizes
docker ps -a --format "table {{.Names}}\t{{.Size}}"
```

### Memory & RAM

```bash
# System-wide
free -h

# Per container
docker stats --no-stream

# Swap status
swapon --show
free -h | grep -i swap
```

### Ollama Specific

```bash
# Models directory size
docker exec ollama du -sh /root/.ollama/models

# Installed models
docker exec ollama ollama list

# Docker volume for ollama
docker volume inspect ollama_data
```

### Complete Docker Usage

```bash
# Overall summary
docker system df

# Detailed breakdown
docker system df --verbose
```

---

## Model Size Comparison

### Mistral (What You Had)
```
Disk:       7 GB
RAM:        4-6 GB active
Speed:      3-5 sec per query
Quality:    Excellent
Codespaces: ❌ Too large (caused swap kill)
Raspberry Pi: ½ Caution (4GB Pi needs swap)
```

### Orca-Mini (What You're Switching To)
```
Disk:       1.5 GB
RAM:        1.5 GB active
Speed:      1-2 sec per query
Quality:    Good for smart home
Codespaces: ✅ Perfect fit
Raspberry Pi: ✅ Runs great
```

### Size Savings
```
Disk freed:     ~5.5 GB
Memory freed:   ~4-6 GB RAM pressure gone
Speed gain:     Instant responses
Result:         Stable & reliable ✨
```

---

## Expected Results After Switch

### Before (Mistral)
```
Disk usage:     ~7-8 GB
RAM usage:      4-6 GB
Swap pressure:  YES - causes crashes
Running status: 🔴 Unstable
```

### After (Orca-Mini)
```
Disk usage:     ~1.5-2 GB
RAM usage:      1.5-2 GB
Swap pressure:  NO - very stable
Running status: 🟢 Stable & responsive
```

---

## Full Resource Breakdown (Codespaces)

### Storage Limits
```
Total available:    32 GB
├─ Docker images:   ~3-4 GB
├─ Ollama model:    ~1.5 GB (orca-mini)
├─ Home Assistant:  ~200-400 MB
├─ ESPHome:         ~50-100 MB
└─ Unused buffer:   ~26-27 GB ✅
```

### Memory Limits
```
Total available:    8 GB
├─ System:          ~1 GB
├─ Home Assistant:  ~1.5 GB
├─ ESPHome:         ~200 MB
├─ Ollama*:         ~1.5 GB (active only)
├─ Swap buffer:     ~4 GB (added)
└─ Available:       ~0-1 GB buffer ✅

* Ollama only uses RAM when model is running
```

---

## Cleanup Commands (If Needed)

### Free Up Disk Space

```bash
# Remove old Docker images
docker image prune -a

# Remove stopped containers
docker container prune

# Remove unused volumes
docker volume prune

# Combined (aggressive)
docker system prune -a -f
```

### Verify Cleanup Worked

```bash
docker system df
```

---

## Performance Testing

### After Switching, Test These:

```bash
# 1. Response time
time docker exec -it ollama ollama run orca-mini "What is a smart home?"

# 2. Memory usage during inference
docker stats --no-stream ollama

# 3. API endpoint
curl http://localhost:11434/api/generate \
  -d '{
    "model":"orca-mini",
    "prompt":"turn on bedroom light",
    "stream":false
  }' | jq .response

# 4. Integration with OpenClaw
curl http://localhost:8080/api/status

# 5. Full Home Assistant to Ollama chain
curl -X POST http://localhost:8080/api/command \
  -H "Content-Type: application/json" \
  -d '{"text":"What devices can you control?","user":"admin"}'
```

---

## Troubleshooting

### If Orca-Mini Runs Slowly

```bash
# Check memory pressure
free -h

# If tight on memory, add swap
sudo fallocate -l 2G /swapfile2
sudo chmod 600 /swapfile2
sudo mkswap /swapfile2
sudo swapon /swapfile2
```

### If Orca-Mini Still Crashes

```bash
# Switch to even smaller model
docker exec ollama ollama rm orca-mini
docker exec ollama ollama pull orca
docker exec -it ollama ollama run orca
```

### If You Need More Power

```bash
# Move to Raspberry Pi (persistent setup)
# See: docs/LOCAL-RASPBERRY-PI.md
```

---

## Monitoring After Switch

### Weekly Check

```bash
# Check model still exists
docker exec ollama ollama list

# Test inference still works
docker exec ollama ollama run orca-mini "test"

# Check logs for errors
docker logs ollama | tail -20
```

### Monthly Check

```bash
# Full resource report
docker system df --verbose

# Update images if needed
docker pull ollama/ollama:latest
docker-compose up -d
```

---

## Summary

| Aspect | Mistral | Orca-Mini | Benefit |
|--------|---------|-----------|---------|
| Disk | 7 GB | 1.5 GB | 5.5 GB saved ✅ |
| RAM Active | 4-6 GB | 1.5 GB | Less pressure ✅ |
| Crashes | Yes (swap) | No | Stability ✅ |
| Speed | 3-5 sec | 1-2 sec | Faster ✅ |
| Quality | Excellent | Good | Perfect for smart home ✅ |
| Codespaces | ❌ Too large | ✅ Perfect | Fits free tier ✅ |

**Result: Stable, responsive, production-ready! 🎯**

---

## Next Steps

1. ✅ Run removal command: `docker exec ollama ollama rm mistral`
2. ✅ Pull new model: `docker exec ollama ollama pull orca-mini`
3. ✅ Update docker-compose.yml (change mistral → orca-mini)
4. ✅ Restart: `docker-compose restart ollama`
5. ✅ Test: `curl http://localhost:11434/api/generate ...`
6. ✅ Monitor: `docker stats ollama`
7. ✅ Commit to git: `git add -A && git commit -m "Switch to orca-mini for stability"`

---

**Status:** Ready to implement  
**Expected duration:** 5 minutes  
**Success indicator:** Orca-Mini runs without crashes or swap pressure
