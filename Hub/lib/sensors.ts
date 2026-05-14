/**
 * ESPHome Sensor Library
 * 
 * Database of available sensors for YAML builder
 * Organized by category for easy picker UI
 */

export type BoardDefinition = {
  id: string
  label: string
  description: string
  yamlTarget: 'esp32' | 'esp8266' | 'rp2040' | 'arduino'
  boardKey: string
}

export type SensorDefinition = {
  id: string
  label: string
  ports: string[]
  category: string
  componentType: 'sensor' | 'binary_sensor' | 'switch' | 'output' | 'display'
  compatibleBoards: string[]
  pinOptions: Partial<Record<string, string[]>>
  yamlTemplate: string
}

export type PinAssignment = {
  sensorId: string
  sensorLabel: string
  pin: string
  componentType: SensorDefinition['componentType']
}

export type PinOverrideMap = Record<string, string>

export type PinHint = {
  label: 'recommended' | 'input-only' | 'analog-only' | 'shared bus'
  reason: string
}

type SensorCatalog = Record<string, SensorDefinition[]>

export type BuilderTemplate = {
  id: string
  name: string
  description: string
  sensors: string[]
  yaml: string
}

export const BOARDS: BoardDefinition[] = [
  {
    id: 'esp32',
    label: 'ESP32',
    description: 'Most popular, great for prototypes',
    yamlTarget: 'esp32',
    boardKey: 'esp32-devkitc-v4',
  },
  {
    id: 'esp8266',
    label: 'ESP8266',
    description: 'Budget option, WiFi enabled',
    yamlTarget: 'esp8266',
    boardKey: 'nodemcuv2',
  },
  {
    id: 'pico_w',
    label: 'Raspberry Pi Pico W',
    description: 'New, WiFi + great performance',
    yamlTarget: 'rp2040',
    boardKey: 'rpipicow',
  },
  {
    id: 'arduino',
    label: 'Arduino',
    description: 'Classic, wide compatibility',
    yamlTarget: 'arduino',
    boardKey: 'uno',
  },
]

export const SENSORS: SensorCatalog = {
  temperature: [
    {
      id: 'dht22',
      label: 'DHT22',
      ports: ['GPIO4'],
      category: 'temperature',
      componentType: 'sensor',
      compatibleBoards: ['esp32', 'esp8266', 'pico_w'],
      pinOptions: {
        esp32: ['GPIO4', 'GPIO5', 'GPIO12', 'GPIO13', 'GPIO14', 'GPIO15', 'GPIO18', 'GPIO19', 'GPIO21', 'GPIO22', 'GPIO23', 'GPIO25', 'GPIO26', 'GPIO27', 'GPIO32', 'GPIO33'],
        esp8266: ['GPIO2', 'GPIO4', 'GPIO5', 'GPIO12', 'GPIO13', 'GPIO14', 'GPIO15', 'GPIO16'],
        pico_w: ['GPIO2', 'GPIO3', 'GPIO4', 'GPIO6', 'GPIO7', 'GPIO8', 'GPIO9', 'GPIO10', 'GPIO11', 'GPIO14', 'GPIO15', 'GPIO16', 'GPIO17', 'GPIO18', 'GPIO19', 'GPIO20', 'GPIO21', 'GPIO22'],
      },
      yamlTemplate: `  - platform: dht
    pin: {{pin}}
    temperature:
      name: "Room Temperature"
    humidity:
      name: "Room Humidity"
    update_interval: 60s`,
    },
    {
      id: 'ds18b20',
      label: 'DS18B20',
      ports: ['GPIO4'],
      category: 'temperature',
      componentType: 'sensor',
      compatibleBoards: ['esp32', 'esp8266', 'pico_w'],
      pinOptions: {
        esp32: ['GPIO4', 'GPIO5', 'GPIO12', 'GPIO13', 'GPIO14', 'GPIO15', 'GPIO16', 'GPIO17', 'GPIO18', 'GPIO19', 'GPIO21', 'GPIO22', 'GPIO23', 'GPIO25', 'GPIO26', 'GPIO27', 'GPIO32', 'GPIO33'],
        esp8266: ['GPIO2', 'GPIO4', 'GPIO5', 'GPIO12', 'GPIO13', 'GPIO14', 'GPIO15', 'GPIO16'],
        pico_w: ['GPIO2', 'GPIO3', 'GPIO4', 'GPIO6', 'GPIO7', 'GPIO8', 'GPIO9', 'GPIO10', 'GPIO11', 'GPIO14', 'GPIO15', 'GPIO16', 'GPIO17', 'GPIO18', 'GPIO19', 'GPIO20', 'GPIO21', 'GPIO22'],
      },
      yamlTemplate: `  - platform: dallas_temp
    pin: {{pin}}
    address: 0x0000000000000001
    name: "Water Temperature"`,
    },
    {
      id: 'bmp280',
      label: 'BMP280',
      ports: ['I2C'],
      category: 'temperature',
      componentType: 'sensor',
      compatibleBoards: ['esp32', 'esp8266', 'pico_w'],
      pinOptions: {
        esp32: ['I2C SDA/SCL'],
        esp8266: ['I2C SDA/SCL'],
        pico_w: ['I2C SDA/SCL'],
      },
      yamlTemplate: `  - platform: bmp280_i2c
    temperature:
      name: "BMP280 Temperature"
    pressure:
      name: "BMP280 Pressure"
    address: 0x76`,
    },
  ],
  motion: [
    {
      id: 'pir',
      label: 'PIR Motion',
      ports: ['GPIO5'],
      category: 'motion',
      componentType: 'binary_sensor',
      compatibleBoards: ['esp32', 'esp8266', 'pico_w', 'arduino'],
      pinOptions: {
        esp32: ['GPIO4', 'GPIO5', 'GPIO12', 'GPIO13', 'GPIO14', 'GPIO15', 'GPIO18', 'GPIO19', 'GPIO21', 'GPIO22', 'GPIO23', 'GPIO25', 'GPIO26', 'GPIO27', 'GPIO32', 'GPIO33'],
        esp8266: ['GPIO2', 'GPIO4', 'GPIO5', 'GPIO12', 'GPIO13', 'GPIO14', 'GPIO15', 'GPIO16'],
        pico_w: ['GPIO2', 'GPIO3', 'GPIO4', 'GPIO6', 'GPIO7', 'GPIO8', 'GPIO9', 'GPIO10', 'GPIO11', 'GPIO14', 'GPIO15', 'GPIO16', 'GPIO17', 'GPIO18', 'GPIO19', 'GPIO20', 'GPIO21', 'GPIO22'],
        arduino: ['D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9', 'D10', 'D11'],
      },
      yamlTemplate: `  - platform: gpio
    pin: {{pin}}
    name: "Hallway Motion"
    device_class: motion`,
    },
    {
      id: 'mmwave',
      label: 'mmWave Radar',
      ports: ['I2C', 'Serial'],
      category: 'motion',
      componentType: 'binary_sensor',
      compatibleBoards: ['esp32', 'pico_w'],
      pinOptions: {
        esp32: ['GPIO4', 'GPIO5', 'GPIO12', 'GPIO13', 'GPIO14', 'GPIO15', 'GPIO16', 'GPIO17', 'GPIO18', 'GPIO19', 'GPIO21', 'GPIO22', 'GPIO23', 'GPIO25', 'GPIO26', 'GPIO27', 'GPIO32', 'GPIO33'],
        pico_w: ['GPIO2', 'GPIO3', 'GPIO4', 'GPIO6', 'GPIO7', 'GPIO8', 'GPIO9', 'GPIO10', 'GPIO11', 'GPIO14', 'GPIO15', 'GPIO16', 'GPIO17', 'GPIO18', 'GPIO19', 'GPIO20', 'GPIO21', 'GPIO22'],
      },
      yamlTemplate: `  - platform: gpio
    pin: {{pin}}
    name: "Presence Radar"
    device_class: motion`,
    },
  ],
  light: [
    {
      id: 'ldr',
      label: 'Light Sensor (LDR)',
      ports: ['ADC'],
      category: 'light',
      componentType: 'sensor',
      compatibleBoards: ['esp32', 'esp8266', 'pico_w', 'arduino'],
      pinOptions: {
        esp32: ['GPIO32', 'GPIO33', 'GPIO34', 'GPIO35'],
        esp8266: ['A0'],
        pico_w: ['GPIO26', 'GPIO27', 'GPIO28'],
        arduino: ['A0', 'A1', 'A2', 'A3', 'A4', 'A5'],
      },
      yamlTemplate: `  - platform: adc
    pin: {{pin}}
    name: "Ambient Light"
    update_interval: 30s`,
    },
    {
      id: 'tsl2561',
      label: 'TSL2561',
      ports: ['I2C'],
      category: 'light',
      componentType: 'sensor',
      compatibleBoards: ['esp32', 'esp8266', 'pico_w'],
      pinOptions: {
        esp32: ['I2C SDA/SCL'],
        esp8266: ['I2C SDA/SCL'],
        pico_w: ['I2C SDA/SCL'],
      },
      yamlTemplate: `  - platform: tsl2561
    name: "Light Level"
    address: 0x39
    update_interval: 30s`,
    },
  ],
  soil: [
    {
      id: 'soil_moisture',
      label: 'Soil Moisture',
      ports: ['ADC'],
      category: 'soil',
      componentType: 'sensor',
      compatibleBoards: ['esp32', 'esp8266', 'pico_w', 'arduino'],
      pinOptions: {
        esp32: ['GPIO32', 'GPIO33', 'GPIO34', 'GPIO35'],
        esp8266: ['A0'],
        pico_w: ['GPIO26', 'GPIO27', 'GPIO28'],
        arduino: ['A0', 'A1', 'A2', 'A3', 'A4', 'A5'],
      },
      yamlTemplate: `  - platform: adc
    pin: {{pin}}
    name: "Soil Moisture"
    update_interval: 60s`,
    },
    {
      id: 'soil_ph',
      label: 'Soil pH',
      ports: ['ADC'],
      category: 'soil',
      componentType: 'sensor',
      compatibleBoards: ['esp32', 'pico_w', 'arduino'],
      pinOptions: {
        esp32: ['GPIO32', 'GPIO33', 'GPIO34', 'GPIO35'],
        pico_w: ['GPIO26', 'GPIO27', 'GPIO28'],
        arduino: ['A0', 'A1', 'A2', 'A3', 'A4', 'A5'],
      },
      yamlTemplate: `  - platform: adc
    pin: {{pin}}
    name: "Soil pH"
    update_interval: 120s`,
    },
  ],
  output: [
    {
      id: 'relay',
      label: 'Relay Module',
      ports: ['GPIO'],
      category: 'output',
      componentType: 'switch',
      compatibleBoards: ['esp32', 'esp8266', 'pico_w', 'arduino'],
      pinOptions: {
        esp32: ['GPIO2', 'GPIO4', 'GPIO5', 'GPIO12', 'GPIO13', 'GPIO14', 'GPIO15', 'GPIO18', 'GPIO19', 'GPIO21', 'GPIO22', 'GPIO23', 'GPIO25', 'GPIO26', 'GPIO27', 'GPIO32', 'GPIO33'],
        esp8266: ['GPIO2', 'GPIO4', 'GPIO5', 'GPIO12', 'GPIO13', 'GPIO14', 'GPIO15', 'GPIO16'],
        pico_w: ['GPIO2', 'GPIO3', 'GPIO4', 'GPIO6', 'GPIO7', 'GPIO8', 'GPIO9', 'GPIO10', 'GPIO11', 'GPIO14', 'GPIO15', 'GPIO16', 'GPIO17', 'GPIO18', 'GPIO19', 'GPIO20', 'GPIO21', 'GPIO22'],
        arduino: ['D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9', 'D10', 'D11'],
      },
      yamlTemplate: `  - platform: gpio
    pin: {{pin}}
    name: "Prototype Relay"`,
    },
    {
      id: 'led',
      label: 'LED',
      ports: ['GPIO'],
      category: 'output',
      componentType: 'output',
      compatibleBoards: ['esp32', 'esp8266', 'pico_w', 'arduino'],
      pinOptions: {
        esp32: ['GPIO2', 'GPIO4', 'GPIO5', 'GPIO12', 'GPIO13', 'GPIO14', 'GPIO15', 'GPIO18', 'GPIO19', 'GPIO21', 'GPIO22', 'GPIO23', 'GPIO25', 'GPIO26', 'GPIO27', 'GPIO32', 'GPIO33'],
        esp8266: ['GPIO2', 'GPIO4', 'GPIO5', 'GPIO12', 'GPIO13', 'GPIO14', 'GPIO15', 'GPIO16'],
        pico_w: ['GPIO2', 'GPIO3', 'GPIO4', 'GPIO6', 'GPIO7', 'GPIO8', 'GPIO9', 'GPIO10', 'GPIO11', 'GPIO14', 'GPIO15', 'GPIO16', 'GPIO17', 'GPIO18', 'GPIO19', 'GPIO20', 'GPIO21', 'GPIO22'],
        arduino: ['D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9', 'D10', 'D11'],
      },
      yamlTemplate: `  - platform: gpio
    pin: {{pin}}
    id: status_led`,
    },
    {
      id: 'buzzer',
      label: 'Buzzer',
      ports: ['GPIO'],
      category: 'output',
      componentType: 'output',
      compatibleBoards: ['esp32', 'esp8266', 'pico_w'],
      pinOptions: {
        esp32: ['GPIO2', 'GPIO4', 'GPIO5', 'GPIO12', 'GPIO13', 'GPIO14', 'GPIO15', 'GPIO18', 'GPIO19', 'GPIO21', 'GPIO22', 'GPIO23', 'GPIO25', 'GPIO26', 'GPIO27', 'GPIO32', 'GPIO33'],
        esp8266: ['GPIO2', 'GPIO4', 'GPIO5', 'GPIO12', 'GPIO13', 'GPIO14', 'GPIO15', 'GPIO16'],
        pico_w: ['GPIO2', 'GPIO3', 'GPIO4', 'GPIO6', 'GPIO7', 'GPIO8', 'GPIO9', 'GPIO10', 'GPIO11', 'GPIO14', 'GPIO15', 'GPIO16', 'GPIO17', 'GPIO18', 'GPIO19', 'GPIO20', 'GPIO21', 'GPIO22'],
      },
      yamlTemplate: `  - platform: ledc
    pin: {{pin}}
    id: alert_buzzer`,
    },
  ],
  display: [
    {
      id: 'oled',
      label: 'OLED Display',
      ports: ['I2C'],
      category: 'display',
      componentType: 'display',
      compatibleBoards: ['esp32', 'esp8266', 'pico_w'],
      pinOptions: {
        esp32: ['I2C SDA/SCL'],
        esp8266: ['I2C SDA/SCL'],
        pico_w: ['I2C SDA/SCL'],
      },
      yamlTemplate: `  - platform: ssd1306_i2c
    model: "SSD1306 128x64"
    address: 0x3C
    lambda: |-
      it.print(0, 0, id(font_small), "SmartHome_JustClick");`,
    },
    {
      id: 'lcd',
      label: 'LCD Display',
      ports: ['I2C', 'Parallel'],
      category: 'display',
      componentType: 'display',
      compatibleBoards: ['esp32', 'esp8266', 'pico_w', 'arduino'],
      pinOptions: {
        esp32: ['I2C SDA/SCL'],
        esp8266: ['I2C SDA/SCL'],
        pico_w: ['I2C SDA/SCL'],
        arduino: ['I2C SDA/SCL'],
      },
      yamlTemplate: `  - platform: lcd_pcf8574
    dimensions: 16x2
    address: 0x27
    lambda: |-
      it.print("System Online");`,
    },
  ],
  input: [
    {
      id: 'button',
      label: 'Button',
      ports: ['GPIO'],
      category: 'input',
      componentType: 'binary_sensor',
      compatibleBoards: ['esp32', 'esp8266', 'pico_w', 'arduino'],
      pinOptions: {
        esp32: ['GPIO4', 'GPIO5', 'GPIO12', 'GPIO13', 'GPIO14', 'GPIO15', 'GPIO18', 'GPIO19', 'GPIO21', 'GPIO22', 'GPIO23', 'GPIO25', 'GPIO26', 'GPIO27', 'GPIO32', 'GPIO33'],
        esp8266: ['GPIO2', 'GPIO4', 'GPIO5', 'GPIO12', 'GPIO13', 'GPIO14', 'GPIO15', 'GPIO16'],
        pico_w: ['GPIO2', 'GPIO3', 'GPIO4', 'GPIO6', 'GPIO7', 'GPIO8', 'GPIO9', 'GPIO10', 'GPIO11', 'GPIO14', 'GPIO15', 'GPIO16', 'GPIO17', 'GPIO18', 'GPIO19', 'GPIO20', 'GPIO21', 'GPIO22'],
        arduino: ['D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9', 'D10', 'D11'],
      },
      yamlTemplate: `  - platform: gpio
    pin:
      number: {{pin}}
      mode: INPUT_PULLUP
      inverted: true
    name: "Wall Button"`,
    },
    {
      id: 'switch',
      label: 'Switch',
      ports: ['GPIO'],
      category: 'input',
      componentType: 'binary_sensor',
      compatibleBoards: ['esp32', 'esp8266', 'pico_w', 'arduino'],
      pinOptions: {
        esp32: ['GPIO4', 'GPIO5', 'GPIO12', 'GPIO13', 'GPIO14', 'GPIO15', 'GPIO18', 'GPIO19', 'GPIO21', 'GPIO22', 'GPIO23', 'GPIO25', 'GPIO26', 'GPIO27', 'GPIO32', 'GPIO33'],
        esp8266: ['GPIO2', 'GPIO4', 'GPIO5', 'GPIO12', 'GPIO13', 'GPIO14', 'GPIO15', 'GPIO16'],
        pico_w: ['GPIO2', 'GPIO3', 'GPIO4', 'GPIO6', 'GPIO7', 'GPIO8', 'GPIO9', 'GPIO10', 'GPIO11', 'GPIO14', 'GPIO15', 'GPIO16', 'GPIO17', 'GPIO18', 'GPIO19', 'GPIO20', 'GPIO21', 'GPIO22'],
        arduino: ['D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9', 'D10', 'D11'],
      },
      yamlTemplate: `  - platform: gpio
    pin: {{pin}}
    name: "Wall Switch"`,
    },
    {
      id: 'potentiometer',
      label: 'Potentiometer',
      ports: ['ADC'],
      category: 'input',
      componentType: 'sensor',
      compatibleBoards: ['esp32', 'esp8266', 'pico_w', 'arduino'],
      pinOptions: {
        esp32: ['GPIO32', 'GPIO33', 'GPIO34', 'GPIO35'],
        esp8266: ['A0'],
        pico_w: ['GPIO28'],
        arduino: ['A0', 'A1', 'A2', 'A3', 'A4', 'A5'],
      },
      yamlTemplate: `  - platform: adc
    pin: {{pin}}
    name: "Control Dial"
    update_interval: 15s`,
    },
  ],
}

export const SENSOR_CATEGORIES = Object.keys(SENSORS) as Array<keyof typeof SENSORS>

export const SENSOR_LOOKUP: Record<string, SensorDefinition> = Object.values(SENSORS)
  .flat()
  .reduce<Record<string, SensorDefinition>>((accumulator, sensor) => {
    accumulator[sensor.id] = sensor
    return accumulator
  }, {})

export const BOARD_PIN_LAYOUTS: Record<string, string[]> = {
  esp32: ['GPIO2', 'GPIO4', 'GPIO5', 'GPIO12', 'GPIO13', 'GPIO14', 'GPIO15', 'GPIO18', 'GPIO19', 'GPIO21', 'GPIO22', 'GPIO23', 'GPIO25', 'GPIO26', 'GPIO27', 'GPIO32', 'GPIO33', 'GPIO34', 'GPIO35', 'I2C SDA/SCL'],
  esp8266: ['GPIO2', 'GPIO4', 'GPIO5', 'GPIO12', 'GPIO13', 'GPIO14', 'GPIO15', 'GPIO16', 'A0', 'I2C SDA/SCL'],
  pico_w: ['GPIO2', 'GPIO3', 'GPIO4', 'GPIO6', 'GPIO7', 'GPIO8', 'GPIO9', 'GPIO10', 'GPIO11', 'GPIO14', 'GPIO15', 'GPIO16', 'GPIO17', 'GPIO18', 'GPIO19', 'GPIO20', 'GPIO21', 'GPIO22', 'GPIO26', 'GPIO27', 'GPIO28', 'I2C SDA/SCL'],
  arduino: ['D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9', 'D10', 'D11', 'A0', 'A1', 'A2', 'A3', 'A4', 'A5', 'I2C SDA/SCL'],
}

export function isSensorCompatibleWithBoard(sensorId: string, boardId: string) {
  const sensor = SENSOR_LOOKUP[sensorId]
  return sensor ? sensor.compatibleBoards.includes(boardId) : false
}

export function assignPinsForBoard(
  boardId: string,
  sensorIds: string[],
  pinOverrides: PinOverrideMap = {},
): PinAssignment[] {
  const usedPins = new Set<string>()

  return sensorIds
    .map((sensorId) => SENSOR_LOOKUP[sensorId])
    .filter(Boolean)
    .map((sensor) => {
      const options = sensor.pinOptions[boardId] ?? []
      const requestedOverride = pinOverrides[sensor.id]
      const validOverride =
        requestedOverride && options.includes(requestedOverride) && !usedPins.has(requestedOverride)
          ? requestedOverride
          : null
      const nextPin =
        validOverride ??
        options.find((pin) => pin.includes('I2C')) ??
        options.find((pin) => !usedPins.has(pin)) ??
        options[0] ??
        'UNASSIGNED'

      if (!nextPin.includes('I2C') && nextPin !== 'UNASSIGNED') {
        usedPins.add(nextPin)
      }

      return {
        sensorId: sensor.id,
        sensorLabel: sensor.label,
        pin: nextPin,
        componentType: sensor.componentType,
      }
    })
}

export function renderSensorYaml(sensorId: string, assignedPin: string) {
  const sensor = SENSOR_LOOKUP[sensorId]
  if (!sensor) return ''

  return sensor.yamlTemplate.split('{{pin}}').join(assignedPin)
}

export function getPinOptionsForSensor(sensorId: string, boardId: string) {
  return SENSOR_LOOKUP[sensorId]?.pinOptions[boardId] ?? []
}

export function getPinHints(pin: string): PinHint[] {
  const hints: PinHint[] = []

  if (pin === 'I2C SDA/SCL') {
    hints.push({
      label: 'shared bus',
      reason: 'Shared bus for I2C peripherals like displays and environmental sensors.',
    })
  }

  if (/^A\d+$/.test(pin) || ['GPIO32', 'GPIO33', 'GPIO34', 'GPIO35', 'GPIO26', 'GPIO27', 'GPIO28'].includes(pin)) {
    hints.push({
      label: 'analog-only',
      reason: 'Best suited for analog reads such as light, soil, or dial inputs.',
    })
  }

  if (['GPIO34', 'GPIO35'].includes(pin)) {
    hints.push({
      label: 'input-only',
      reason: 'Input-only pin. Good for sensors, not for driving relays or LEDs.',
    })
  }

  if (['GPIO4', 'GPIO5', 'GPIO14', 'GPIO18', 'GPIO21', 'GPIO22', 'D2', 'D3', 'D4', 'A0'].includes(pin)) {
    hints.push({
      label: 'recommended',
      reason: 'Generally flexible and commonly used without boot-mode surprises.',
    })
  }

  return hints
}

export function getSensorAwarePinHints(sensorId: string, pin: string): PinHint[] {
  const sensor = SENSOR_LOOKUP[sensorId]
  if (!sensor) return getPinHints(pin)

  const baseHints = getPinHints(pin)
  const sensorHints: PinHint[] = []
  const isAnalogCapable = baseHints.some((hint) => hint.label === 'analog-only')
  const isSharedBus = baseHints.some((hint) => hint.label === 'shared bus')

  if (sensor.ports.includes('ADC') && isAnalogCapable) {
    sensorHints.push({
      label: 'recommended',
      reason: `${sensor.label} reads analog values, so this pin is the most natural fit.`,
    })
  }

  if (sensor.ports.includes('I2C') && isSharedBus) {
    sensorHints.push({
      label: 'recommended',
      reason: `${sensor.label} is bus-based, so the shared I2C connection is the preferred path.`,
    })
  }

  if (
    !sensor.ports.includes('ADC') &&
    !sensor.ports.includes('I2C') &&
    !isAnalogCapable &&
    !isSharedBus &&
    ['switch', 'output', 'binary_sensor'].includes(sensor.componentType)
  ) {
    sensorHints.push({
      label: 'recommended',
      reason: `${sensor.label} prefers straightforward digital GPIO wiring.`,
    })
  }

  return dedupePinHints([...sensorHints, ...baseHints])
}

export function getSortedPinOptionsForSensor(sensorId: string, boardId: string) {
  const options = getPinOptionsForSensor(sensorId, boardId)
  return [...options].sort((left, right) => getPinPriority(sensorId, right) - getPinPriority(sensorId, left))
}

export function formatPinOptionLabel(sensorId: string, pin: string) {
  const hints = getSensorAwarePinHints(sensorId, pin)
  if (!hints.length) return pin

  return `${pin} · ${hints.map((hint) => hint.label).join(', ')}`
}

function getPinPriority(sensorId: string, pin: string) {
  const hints = getSensorAwarePinHints(sensorId, pin)

  return hints.reduce((score, hint) => {
    switch (hint.label) {
      case 'recommended':
        return score + 4
      case 'shared bus':
        return score + 3
      case 'analog-only':
        return score + 2
      case 'input-only':
        return score + 1
      default:
        return score
    }
  }, 0)
}

function dedupePinHints(hints: PinHint[]) {
  return hints.filter(
    (hint, index) => hints.findIndex((candidate) => candidate.label === hint.label) === index,
  )
}

export const TEMPLATES: BuilderTemplate[] = [
  {
    id: 'temp-humidity',
    name: 'Hallway Temperature & Humidity',
    description: 'DHT22 sensor to monitor room conditions',
    sensors: ['dht22'],
    yaml: `esphome:
  name: hallway-temp-sensor

esp32:
  board: esp32-devkitc-v4

wifi:
  ssid: !secret wifi_ssid
  password: !secret wifi_password

sensor:
  - platform: dht
    pin: GPIO4
    temperature:
      name: "Hallway Temperature"
    humidity:
      name: "Hallway Humidity"
    update_interval: 60s

api:
homeassistant:
`,
  },
  {
    id: 'plant-monitor',
    name: 'Plant Moisture Monitor',
    description: 'Soil moisture + temperature sensor for plant care',
    sensors: ['soil_moisture', 'dht22'],
    yaml: `esphome:
  name: plant-monitor

esp32:
  board: esp32-devkitc-v4

wifi:
  ssid: !secret wifi_ssid
  password: !secret wifi_password

sensor:
  - platform: adc
    pin: GPIO35
    name: "Soil Moisture"
    update_interval: 60s
  - platform: dht
    pin: GPIO4
    temperature:
      name: "Plant Temperature"

api:
homeassistant:
`,
  },
  {
    id: 'motion-light',
    name: 'Motion + Light Sensor',
    description: 'Detect motion and ambient light for automation',
    sensors: ['pir', 'ldr'],
    yaml: `esphome:
  name: motion-light-sensor

esp32:
  board: esp32-devkitc-v4

wifi:
  ssid: !secret wifi_ssid
  password: !secret wifi_password

binary_sensor:
  - platform: gpio
    pin: GPIO5
    name: "Motion"

sensor:
  - platform: adc
    pin: GPIO32
    name: "Light Level"

api:
homeassistant:
`,
  },
]
