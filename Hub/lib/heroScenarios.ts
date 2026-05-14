export type HeroScenario = {
  id: string
  label: string
  prompt: string
  summary: string
  responses: string[]
  yaml: string
  keywords: string[]
}

export const HERO_SCENARIOS: HeroScenario[] = [
  {
    id: 'goodnight-mode',
    label: 'Goodnight Mode',
    prompt: 'Goodnight mode',
    summary: 'Locks the front door, turns off lights, and powers down the prototype fan.',
    responses: [
      'Locking doors...',
      'Turning off lights...',
      'Prototype fan off...',
      'Done. YAML generated below.',
    ],
    keywords: ['goodnight', 'night', 'bedtime', 'sleep'],
    yaml: `automation:
  - alias: "Goodnight Mode"
    trigger:
      platform: state
      entity_id: input_button.goodnight_mode
    action:
      - service: lock.lock
        target:
          entity_id: lock.front_door
      - service: light.turn_off
        target:
          entity_id: light.all_lights
      - service: switch.turn_off
        target:
          entity_id: switch.prototype_fan`,
  },
  {
    id: 'morning-routine',
    label: 'Morning Routine',
    prompt: 'Morning routine',
    summary: 'Brings the house online with lights, coffee, and a thermostat bump.',
    responses: [
      'Kitchen lights on...',
      'Starting coffee maker...',
      'Raising thermostat...',
      'Done. YAML generated below.',
    ],
    keywords: ['morning', 'wake', 'breakfast', 'coffee'],
    yaml: `automation:
  - alias: "Morning Routine"
    trigger:
      platform: time
      at: "06:30:00"
    action:
      - service: light.turn_on
        target:
          entity_id:
            - light.kitchen
            - light.hallway
      - service: switch.turn_on
        target:
          entity_id: switch.coffee_station
      - service: climate.set_temperature
        target:
          entity_id: climate.downstairs
        data:
          temperature: 71`,
  },
  {
    id: 'away-mode',
    label: 'Away Mode',
    prompt: 'Away mode',
    summary: 'Arms the home for an empty house with locks, thermostat setback, and notifications.',
    responses: [
      'Checking doors...',
      'Arming away profile...',
      'Reducing climate usage...',
      'Done. YAML generated below.',
    ],
    keywords: ['away', 'leave', 'vacation', 'out'],
    yaml: `automation:
  - alias: "Away Mode"
    trigger:
      platform: state
      entity_id: input_boolean.away_mode
      to: "on"
    action:
      - service: lock.lock
        target:
          entity_id:
            - lock.front_door
            - lock.back_door
      - service: climate.set_preset_mode
        target:
          entity_id: climate.downstairs
        data:
          preset_mode: away
      - service: notify.mobile_app_owner
        data:
          message: "Away mode enabled. Home secured."`,
  },
  {
    id: 'movie-time',
    label: 'Movie Time',
    prompt: 'Movie time',
    summary: 'Dims the room, closes shades, and powers the media scene.',
    responses: [
      'Dimming living room lights...',
      'Closing shades...',
      'Powering media scene...',
      'Done. YAML generated below.',
    ],
    keywords: ['movie', 'cinema', 'tv', 'watch'],
    yaml: `automation:
  - alias: "Movie Time"
    trigger:
      platform: state
      entity_id: input_button.movie_time
    action:
      - service: light.turn_on
        target:
          entity_id: light.living_room
        data:
          brightness_pct: 20
      - service: cover.close_cover
        target:
          entity_id: cover.living_room_shades
      - service: scene.turn_on
        target:
          entity_id: scene.media_mode`,
  },
]

export function findHeroScenario(input: string): HeroScenario | null {
  const normalized = input.trim().toLowerCase()
  if (!normalized) return null

  for (const scenario of HERO_SCENARIOS) {
    if (
      normalized === scenario.prompt.toLowerCase() ||
      scenario.keywords.some((keyword) => normalized.includes(keyword))
    ) {
      return scenario
    }
  }

  return null
}
