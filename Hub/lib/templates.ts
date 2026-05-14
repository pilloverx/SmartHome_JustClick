/**
 * Template Library for Skills and Automation
 * 
 * Pre-built templates for common use cases
 */

export const SKILL_TEMPLATES = [
  {
    id: 'goodnight',
    name: 'Goodnight Mode',
    description: 'Lock doors, turn off lights, close garage',
    triggers: ['time', 'manual'],
    actions: ['lock', 'light_off', 'garage_close'],
  },
  {
    id: 'plant-alert',
    name: 'Plant Alert',
    description: 'Notify when soil moisture is too low',
    triggers: ['sensor'],
    actions: ['notify', 'turn_on_pump'],
  },
  {
    id: 'commute-safe',
    name: 'Commute Safety',
    description: 'Lock doors when all phones leave home',
    triggers: ['geolocation'],
    actions: ['lock_doors', 'security_camera_on'],
  },
  {
    id: 'vacation-mode',
    name: 'Vacation Mode',
    description: 'Random lights, disable security alerts',
    triggers: ['manual', 'schedule'],
    actions: ['random_lights', 'alert_disable'],
  },
]

export const PYTHON_TEMPLATE = `# Smart Home Automation Skill
# Auto-generated from ClawHub Skill Generator

class AutomationSkill:
    def __init__(self, hass):
        self.hass = hass
    
    async def async_trigger(self, data):
        """Handle trigger event"""
        pass
    
    async def async_execute(self, data):
        """Execute the automation"""
        pass
`

export const SOUL_MD_TEMPLATE = `# Skill: {{skillName}}

## Description
{{description}}

## Triggers
- {{trigger}}

## Actions
- {{action}}

## Configuration
\`\`\`yaml
# Home Assistant YAML config
automation:
  - alias: {{skillName}}
    trigger:
      platform: time
    action:
      service: light.turn_off
\`\`\`
`

export const CODE_EXAMPLES = {
  yaml_basic: `esphome:
  name: my-device

esp32:
  board: esp32-devkitc-v4

wifi:
  ssid: !secret wifi_ssid
  password: !secret wifi_password

sensor:
  - platform: dht
    pin: GPIO4
    temperature:
      name: "Temperature"

api:
homeassistant:`,

  ha_automation: `automation:
  - alias: "Good Night"
    trigger:
      platform: time
      at: "22:30:00"
    action:
      - service: light.turn_off
        data:
          entity_id: light.all
      - service: lock.lock
        data:
          entity_id: lock.front_door`,

  docker_compose: `version: '3.8'

services:
  homeassistant:
    image: ghcr.io/home-assistant/home-assistant:latest
    container_name: homeassistant
    restart: always
    ports:
      - "8123:8123"
    volumes:
      - ./homeassistant:/config
    environment:
      - TZ=UTC`,
}
