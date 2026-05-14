'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Check, CheckCircle2, Copy, Cpu, Download, Radio, Sparkles } from 'lucide-react'
import { HERO_SCENARIOS } from '../../lib/heroScenarios'
import {
  assignPinsForBoard,
  BOARD_PIN_LAYOUTS,
  BOARDS,
  formatPinOptionLabel,
  getPinHints,
  getPinOptionsForSensor,
  getSensorAwarePinHints,
  getSortedPinOptionsForSensor,
  isSensorCompatibleWithBoard,
  renderSensorYaml,
  SENSOR_CATEGORIES,
  SENSORS,
  SENSOR_LOOKUP,
  TEMPLATES,
  type BoardDefinition,
  type PinOverrideMap,
} from '../../lib/sensors'
import { copyToClipboard, downloadFile } from '../../lib/utils'

/**
 * YAML Builder Component
 * 
 * Interactive interface for building ESPHome and Home Assistant YAML configs
 * Status: Active development (Phase C)
 * 
 * Features to implement:
 * - Board selector (ESP32, ESP8266, Pico W, Arduino)
 * - Sensor picker (DHT22, DS18B20, motion, soil, relay, LED, etc.)
 * - Pin assignment visualization
 * - Real-time YAML preview
 * - Download & copy functionality
 * - Template gallery
 */

type YamlBuilderProps = {
  initialScenarioId?: string | null
}

export default function YamlBuilder({ initialScenarioId = null }: YamlBuilderProps) {
  const selectedScenario = HERO_SCENARIOS.find((scenario) => scenario.id === initialScenarioId) ?? null
  const [selectedBoardId, setSelectedBoardId] = useState<string>(BOARDS[0].id)
  const [selectedSensorIds, setSelectedSensorIds] = useState<string[]>([])
  const [deviceName, setDeviceName] = useState('smart-node')
  const [pinOverrides, setPinOverrides] = useState<PinOverrideMap>({})
  const [deviceTick, setDeviceTick] = useState(0)
  const [flashStepIndex, setFlashStepIndex] = useState(-1)
  const [flashComplete, setFlashComplete] = useState(false)
  const [flashRunId, setFlashRunId] = useState(0)
  const [yamlCopied, setYamlCopied] = useState(false)
  const [dockerCopied, setDockerCopied] = useState(false)
  const [wokwiExported, setWokwiExported] = useState(false)
  const [appliedTemplate, setAppliedTemplate] = useState<string | null>(null)
  const [pinMapTargetSensorId, setPinMapTargetSensorId] = useState<string | null>(null)
  const [pinMapStatus, setPinMapStatus] = useState<string | null>(null)
  const [confettiRunId, setConfettiRunId] = useState(0)

  useEffect(() => {
    if (selectedScenario?.id === 'morning-routine') {
      setSelectedSensorIds(['dht22', 'relay'])
      setDeviceName('morning-station')
      setPinOverrides({})
      return
    }

    if (selectedScenario?.id === 'away-mode') {
      setSelectedSensorIds(['pir', 'button'])
      setDeviceName('entry-guard')
      setPinOverrides({})
      return
    }

    if (selectedScenario?.id === 'movie-time') {
      setSelectedSensorIds(['ldr', 'relay'])
      setDeviceName('media-scene-node')
      setPinOverrides({})
      return
    }

    if (selectedScenario?.id === 'goodnight-mode') {
      setSelectedSensorIds(['button', 'relay'])
      setDeviceName('bedtime-node')
      setPinOverrides({})
    }
  }, [selectedScenario?.id])

  useEffect(() => {
    setSelectedSensorIds((current) =>
      filterCompatibleSensorIds(current, selectedBoardId),
    )
    setPinOverrides((current) => {
      const nextOverrides = Object.entries(current).reduce<PinOverrideMap>((accumulator, [sensorId, pin]) => {
        if (
          selectedSensorIds.includes(sensorId) &&
          getPinOptionsForSensor(sensorId, selectedBoardId).includes(pin)
        ) {
          accumulator[sensorId] = pin
        }
        return accumulator
      }, {})

      return arePinOverridesEqual(current, nextOverrides) ? current : nextOverrides
    })
  }, [selectedBoardId, selectedSensorIds])

  useEffect(() => {
    if (!pinMapTargetSensorId) return
    if (!selectedSensorIds.includes(pinMapTargetSensorId)) {
      setPinMapTargetSensorId(null)
    }
  }, [pinMapTargetSensorId, selectedSensorIds])

  const selectedBoard = BOARDS.find((board) => board.id === selectedBoardId) ?? BOARDS[0]

  const selectedSensors = useMemo(
    () => selectedSensorIds
      .map((sensorId) => SENSOR_LOOKUP[sensorId])
      .filter(Boolean),
    [selectedSensorIds],
  )

  const simulatedReadings = useMemo(
    () => selectedSensors.map((sensor, index) => ({
      sensorId: sensor.id,
      label: sensor.label,
      value: getSimulatedSensorValue(sensor.id, deviceTick, index),
    })),
    [deviceTick, selectedSensors],
  )

  const pinAssignments = useMemo(
    () => assignPinsForBoard(selectedBoardId, selectedSensorIds, pinOverrides),
    [pinOverrides, selectedBoardId, selectedSensorIds],
  )

  const toggleSensor = (sensorId: string) => {
    setSelectedSensorIds((current) =>
      current.includes(sensorId)
        ? current.filter((id) => id !== sensorId)
        : [...current, sensorId],
    )
    setPinOverrides((current) => {
      if (!(sensorId in current)) return current
      const nextOverrides = { ...current }
      delete nextOverrides[sensorId]
      return nextOverrides
    })
  }

  const handlePinOverrideChange = (sensorId: string, pin: string) => {
    setPinOverrides((current) => ({
      ...current,
      [sensorId]: pin,
    }))
  }

  const liveYaml = useMemo(
    () => buildBuilderYaml({
      deviceName,
      board: selectedBoard,
      pinAssignments,
      selectedScenarioYaml: selectedScenario?.yaml ?? null,
    }),
    [deviceName, pinAssignments, selectedBoard, selectedScenario?.yaml],
  )

  const normalizedDeviceName = useMemo(() => {
    const normalized = deviceName.trim().toLowerCase().replace(/\s+/g, '-')
    return normalized || 'smart-node'
  }, [deviceName])

  const flashSteps = useMemo(
    () => [
      `Validate ${deviceName.trim() || 'device'} YAML`,
      `Compile firmware for ${selectedBoard.label}`,
      'Provision virtual device image',
      'Connect simulated node to Home Assistant',
    ],
    [deviceName, selectedBoard.label],
  )

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setDeviceTick((current) => current + 1)
    }, 1800)

    return () => window.clearInterval(intervalId)
  }, [])

  useEffect(() => {
    if (flashStepIndex < 0) return undefined

    if (flashStepIndex >= flashSteps.length) {
      if (!flashComplete) {
        setFlashComplete(true)
        setConfettiRunId((current) => current + 1)
      }
      return undefined
    }

    const timeoutId = window.setTimeout(() => {
      setFlashStepIndex((current) => current + 1)
    }, 850)

    return () => window.clearTimeout(timeoutId)
  }, [flashComplete, flashStepIndex, flashSteps.length, flashRunId])

  const handleCopyYaml = async () => {
    const copied = await copyToClipboard(liveYaml)
    if (!copied) return

    setYamlCopied(true)
    window.setTimeout(() => setYamlCopied(false), 1800)
  }

  const handleDownloadYaml = () => {
    downloadFile(liveYaml, `${normalizedDeviceName}.yaml`)
  }

  const handleCopyComposeSnippet = async () => {
    const copied = await copyToClipboard(buildDockerComposeSnippet(normalizedDeviceName))
    if (!copied) return

    setDockerCopied(true)
    window.setTimeout(() => setDockerCopied(false), 2200)
  }

  const handleExportWokwi = () => {
    const wokwiToml = buildWokwiToml(normalizedDeviceName)
    const diagramJson = buildWokwiDiagramJson(selectedBoard.label, pinAssignments)

    downloadFile(wokwiToml, 'wokwi.toml')
    window.setTimeout(() => {
      downloadFile(diagramJson, 'diagram.json')
    }, 120)

    setWokwiExported(true)
    window.setTimeout(() => setWokwiExported(false), 2400)
  }

  const applyTemplate = (templateId: string) => {
    const selectedTemplate = TEMPLATES.find((template) => template.id === templateId)
    if (!selectedTemplate) return

    setSelectedSensorIds(filterCompatibleSensorIds(selectedTemplate.sensors, selectedBoardId))
    setPinOverrides({})
    setDeviceName(extractNameFromTemplateYaml(selectedTemplate.yaml, selectedTemplate.id))
    setAppliedTemplate(selectedTemplate.name)
    window.setTimeout(() => setAppliedTemplate(null), 2400)
  }

  const pushPinMapStatus = (message: string) => {
    setPinMapStatus(message)
    window.setTimeout(() => setPinMapStatus(null), 2600)
  }

  const handlePinTileClick = (pin: string) => {
    if (!pinMapTargetSensorId) {
      pushPinMapStatus('Select "Map from Diagram" on a sensor first, then click a pin tile.')
      return
    }

    const availableOptions = getPinOptionsForSensor(pinMapTargetSensorId, selectedBoardId)
    if (!availableOptions.includes(pin)) {
      const targetLabel = SENSOR_LOOKUP[pinMapTargetSensorId]?.label ?? 'Selected sensor'
      pushPinMapStatus(`${targetLabel} does not support ${pin} on ${selectedBoard.label}.`)
      return
    }

    const occupiedByOther = pinAssignments.find(
      (assignment) => assignment.pin === pin && assignment.sensorId !== pinMapTargetSensorId,
    )

    if (occupiedByOther) {
      pushPinMapStatus(`${pin} is already assigned to ${occupiedByOther.sensorLabel}.`)
      return
    }

    handlePinOverrideChange(pinMapTargetSensorId, pin)
    const targetLabel = SENSOR_LOOKUP[pinMapTargetSensorId]?.label ?? 'Sensor'
    pushPinMapStatus(`${targetLabel} mapped to ${pin}.`)
    setPinMapTargetSensorId(null)
  }

  return (
    <section id="builder" className="py-20 bg-gray-50 dark:bg-ha-surface-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card-ha p-8 md:p-12">
          <h2 className="text-3xl font-bold mb-4">YAML Builder</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-3xl">
            Interactive interface to build ESPHome and Home Assistant configurations.
            Phase C workflows are now end-to-end: interactive pin mapping, live YAML, device simulation, flash walkthrough, and export handoff.
          </p>
          <div className="grid gap-6 lg:grid-cols-[1.08fr,0.92fr]">
            <div className="space-y-6">
              <div className="rounded-xl border border-ha-border dark:border-ha-border-dark bg-white dark:bg-ha-primary/5 p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Device</p>
                    <h3 className="mt-2 text-xl font-semibold">Board Selector</h3>
                  </div>
                  <span className="badge-online">Phase C</span>
                </div>
                <label className="mt-5 block">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Node Name</span>
                  <input
                    value={deviceName}
                    onChange={(event) => setDeviceName(event.target.value)}
                    className="mt-2 w-full rounded-lg border border-ha-border dark:border-ha-border-dark bg-white dark:bg-ha-surface-dark px-3 py-2 text-sm outline-none focus:border-ha-primary"
                    placeholder="living-room-node"
                  />
                </label>
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {BOARDS.map((board) => {
                    const isSelected = board.id === selectedBoardId
                    return (
                      <button
                        key={board.id}
                        type="button"
                        onClick={() => setSelectedBoardId(board.id)}
                        className={`rounded-xl border p-4 text-left transition-colors ${
                          isSelected
                            ? 'border-ha-primary bg-ha-primary/10 shadow-sm'
                            : 'border-ha-border dark:border-ha-border-dark hover:border-ha-primary/50 hover:bg-ha-primary/5'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-semibold">{board.label}</span>
                          <span className="text-xs text-gray-500">{board.boardKey}</span>
                        </div>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                          {board.description}
                        </p>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="rounded-xl border border-ha-border dark:border-ha-border-dark bg-white dark:bg-ha-primary/5 p-6">
                <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Hardware</p>
                <h3 className="mt-2 text-xl font-semibold">Sensor Picker</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Choose the modules this node should expose. The YAML preview updates immediately.
                </p>

                <div className="mt-5 space-y-5">
                  {SENSOR_CATEGORIES.map((category) => (
                    <div key={category}>
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <h4 className="text-sm font-semibold capitalize">{category}</h4>
                        <span className="text-xs text-gray-500">
                          {SENSORS[category].length} options
                        </span>
                      </div>
                      <div className="grid gap-3 md:grid-cols-2">
                        {SENSORS[category].map((sensor) => {
                          const isSelected = selectedSensorIds.includes(sensor.id)
                          const isCompatible = sensor.compatibleBoards.includes(selectedBoardId)
                          return (
                            <button
                              key={sensor.id}
                              type="button"
                              onClick={() => {
                                if (!isCompatible) return
                                toggleSensor(sensor.id)
                              }}
                              disabled={!isCompatible}
                              className={`rounded-xl border p-4 text-left transition-colors ${
                                isSelected
                                  ? 'border-esp-primary bg-esp-primary/10 shadow-sm'
                                  : isCompatible
                                    ? 'border-ha-border dark:border-ha-border-dark hover:border-esp-primary/50 hover:bg-esp-primary/5'
                                    : 'border-ha-border/60 bg-gray-100/80 text-gray-400 opacity-60 dark:border-ha-border-dark/60 dark:bg-ha-surface-dark/60'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-3">
                                <span className="font-medium">{sensor.label}</span>
                                <span className="text-xs text-gray-500">
                                  {isCompatible ? sensor.componentType : 'unsupported'}
                                </span>
                              </div>
                              <p className="mt-2 text-xs text-gray-500">
                                Ports: {sensor.ports.join(', ')}
                              </p>
                              <p className="mt-1 text-xs text-gray-500">
                                Boards: {sensor.compatibleBoards.join(', ')}
                              </p>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-ha-border dark:border-ha-border-dark bg-white dark:bg-ha-primary/5 p-6">
                <p className="text-xs uppercase tracking-[0.18em] text-gray-500">C7 Templates</p>
                <h3 className="mt-2 text-xl font-semibold">Steal & Customize</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Start from proven sensor packs, then tune pins and YAML in this workspace.
                </p>
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {TEMPLATES.map((template) => (
                    <div
                      key={template.id}
                      className="rounded-xl border border-ha-border dark:border-ha-border-dark p-4"
                    >
                      <p className="font-medium">{template.name}</p>
                      <p className="mt-1 text-xs text-gray-500">{template.description}</p>
                      <p className="mt-2 text-xs text-gray-500">
                        Sensors: {template.sensors.join(', ')}
                      </p>
                      <button
                        type="button"
                        onClick={() => applyTemplate(template.id)}
                        className="mt-3 inline-flex items-center rounded-lg border border-ha-primary/40 px-3 py-1.5 text-xs font-medium text-ha-primary transition-colors hover:bg-ha-primary/10"
                      >
                        Steal & Customize
                      </button>
                    </div>
                  ))}
                </div>
                {appliedTemplate && (
                  <p className="mt-4 text-sm text-green-600 dark:text-green-300">
                    Template loaded: {appliedTemplate}
                  </p>
                )}
              </div>

              <div className="rounded-xl border border-ha-border dark:border-ha-border-dark bg-white dark:bg-ha-primary/5 p-6">
                <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Pin Control</p>
                <h3 className="mt-2 text-xl font-semibold">Manual Pin Overrides</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Fine-tune the auto-assigned pins for each selected sensor on {selectedBoard.label}.
                </p>

                <div className="mt-5 space-y-4">
                  {pinAssignments.length > 0 ? (
                    pinAssignments.map((assignment) => {
                      const sensor = SENSOR_LOOKUP[assignment.sensorId]
                      const options = getSortedPinOptionsForSensor(assignment.sensorId, selectedBoardId)
                      const activePinHints = getSensorAwarePinHints(assignment.sensorId, assignment.pin)
                      return (
                        <div
                          key={assignment.sensorId}
                          className="rounded-xl border border-ha-border dark:border-ha-border-dark p-4"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="font-medium">{assignment.sensorLabel}</p>
                              <p className="mt-1 text-xs text-gray-500">
                                {sensor?.componentType} on {assignment.pin}
                              </p>
                              {activePinHints.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {activePinHints.map((hint) => (
                                    <span
                                      key={`${assignment.sensorId}-${hint.label}`}
                                      className="rounded-full border border-ha-border dark:border-ha-border-dark px-2 py-1 text-[11px] text-gray-600 dark:text-gray-300"
                                      title={hint.reason}
                                    >
                                      {hint.label}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col gap-2 sm:items-end">
                              <select
                                value={assignment.pin}
                                onChange={(event) => handlePinOverrideChange(assignment.sensorId, event.target.value)}
                                className="rounded-lg border border-ha-border dark:border-ha-border-dark bg-white dark:bg-ha-surface-dark px-3 py-2 text-sm outline-none focus:border-ha-primary"
                              >
                                {options.map((option) => {
                                  const usedByOther = pinAssignments.some(
                                    (item) => item.sensorId !== assignment.sensorId && item.pin === option,
                                  )
                                  return (
                                    <option key={option} value={option} disabled={usedByOther}>
                                      {formatPinOptionLabel(assignment.sensorId, option)}{usedByOther ? ' (in use)' : ''}
                                    </option>
                                  )
                                })}
                              </select>
                              <button
                                type="button"
                                onClick={() => {
                                  setPinMapTargetSensorId((current) =>
                                    current === assignment.sensorId ? null : assignment.sensorId,
                                  )
                                  setPinMapStatus(null)
                                }}
                                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                                  pinMapTargetSensorId === assignment.sensorId
                                    ? 'border-ha-primary bg-ha-primary/10 text-ha-primary'
                                    : 'border-ha-border dark:border-ha-border-dark text-gray-600 dark:text-gray-300 hover:border-ha-primary/50 hover:text-ha-primary'
                                }`}
                              >
                                {pinMapTargetSensorId === assignment.sensorId ? 'Pin Map Armed' : 'Map from Diagram'}
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="rounded-xl border border-dashed border-ha-border dark:border-ha-border-dark p-4 text-sm text-gray-500">
                      Select one or more compatible sensors to unlock manual pin overrides.
                    </div>
                  )}
                  {pinAssignments.length > 0 && (
                    <div className="rounded-lg border border-dashed border-ha-border dark:border-ha-border-dark p-3 text-xs text-gray-600 dark:text-gray-300">
                      <p>
                        {pinMapTargetSensorId
                          ? `Pin map mode active for ${SENSOR_LOOKUP[pinMapTargetSensorId]?.label}. Click a pin tile on the right panel.`
                          : 'Click "Map from Diagram" on a sensor, then click a pin tile in the right panel to assign instantly.'}
                      </p>
                      {pinMapStatus && (
                        <p className="mt-2 text-ha-primary dark:text-blue-300">{pinMapStatus}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-gray-900 dark:bg-gray-950 p-5 min-h-80">
              <div className="mb-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Live YAML</p>
                    <h3 className="mt-2 text-lg font-semibold text-white">
                      {deviceName.trim() || 'smart-node'}
                    </h3>
                    <p className="mt-2 text-sm text-gray-400">
                      Board: {selectedBoard.label}. Sensors selected: {selectedSensors.length}.
                    </p>
                    {selectedScenario && (
                      <p className="mt-2 text-sm text-gray-500">
                        Hero handoff: {selectedScenario.label}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => void handleCopyYaml()}
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-700 px-3 py-2 text-sm text-gray-100 transition-colors hover:border-ha-primary hover:text-white"
                    >
                      {yamlCopied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                      {yamlCopied ? 'Copied' : 'Copy YAML'}
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadYaml}
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-700 px-3 py-2 text-sm text-gray-100 transition-colors hover:border-ha-primary hover:text-white"
                    >
                      <Download className="h-4 w-4" />
                      Download YAML
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleCopyComposeSnippet()}
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-700 px-3 py-2 text-sm text-gray-100 transition-colors hover:border-ha-primary hover:text-white"
                    >
                      {dockerCopied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                      {dockerCopied ? 'Compose Copied' : 'Add to docker-compose'}
                    </button>
                    <button
                      type="button"
                      onClick={handleExportWokwi}
                      className="inline-flex items-center gap-2 rounded-lg bg-ha-primary px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-ha-primary-dark"
                    >
                      <Sparkles className="h-4 w-4" />
                      Simulate in Wokwi
                    </button>
                  </div>
                </div>
              </div>

              <div className="relative mb-5 overflow-hidden rounded-xl border border-ha-border/40 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-gray-500">C4 Device Simulation</p>
                    <h4 className="mt-2 flex items-center gap-2 text-base font-semibold text-white">
                      <Radio className="h-4 w-4 text-ha-primary" />
                      Virtual Node Card
                    </h4>
                  </div>
                  <span className="rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs text-green-300">
                    Online
                  </span>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-gray-800 bg-black/20 p-3">
                    <p className="text-xs text-gray-500">Board</p>
                    <p className="mt-1 font-medium text-gray-100">{selectedBoard.label}</p>
                    <p className="mt-1 text-xs text-gray-500">{selectedBoard.boardKey}</p>
                  </div>
                  <div className="rounded-lg border border-gray-800 bg-black/20 p-3">
                    <p className="text-xs text-gray-500">Connection</p>
                    <p className="mt-1 font-medium text-gray-100">Home Assistant API linked</p>
                    <p className="mt-1 text-xs text-gray-500">Last heartbeat: {deviceTick % 2 === 0 ? 'just now' : '2s ago'}</p>
                  </div>
                </div>
                <div className="mt-4 space-y-3">
                  {simulatedReadings.length > 0 ? (
                    simulatedReadings.map((reading) => (
                      <div
                        key={reading.sensorId}
                        className="flex items-center justify-between rounded-lg border border-gray-800 bg-black/20 px-3 py-3"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-100">{reading.label}</p>
                          <p className="text-xs text-gray-500">Simulated live reading</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-green-300">{reading.value}</p>
                          <p className="text-xs text-gray-500">refreshing</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-lg border border-dashed border-gray-800 bg-black/20 p-4 text-sm text-gray-500">
                      Add sensors on the left to populate the device simulation card.
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-5 rounded-xl border border-ha-border/40 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-gray-500">C5 Firmware Flow</p>
                    <h4 className="mt-2 flex items-center gap-2 text-base font-semibold text-white">
                      <Cpu className="h-4 w-4 text-esp-primary" />
                      Simulate Flash
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFlashComplete(false)
                      setFlashRunId((current) => current + 1)
                      setFlashStepIndex(0)
                    }}
                    className="rounded-lg bg-esp-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-esp-primary-dark"
                  >
                    {flashStepIndex >= 0 && flashStepIndex < flashSteps.length ? 'Flashing...' : 'Simulate Flash'}
                  </button>
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-black/30">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-ha-primary to-esp-primary transition-all duration-700"
                    style={{
                      width: `${flashComplete ? 100 : Math.max(0, ((flashStepIndex + 1) / flashSteps.length) * 100)}%`,
                    }}
                  />
                </div>

                <div className="mt-4 space-y-2">
                  {flashSteps.map((step, index) => {
                    const status =
                      flashComplete || index < flashStepIndex
                        ? 'done'
                        : index === flashStepIndex
                          ? 'active'
                          : 'pending'

                    return (
                      <div
                        key={step}
                        className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${
                          status === 'done'
                            ? 'border-green-500/30 bg-green-500/10 text-green-200'
                            : status === 'active'
                              ? 'border-ha-primary/40 bg-ha-primary/10 text-blue-100'
                              : 'border-gray-800 bg-black/20 text-gray-500'
                        }`}
                      >
                        <span>{step}</span>
                        <span className="text-xs uppercase tracking-[0.16em]">
                          {status === 'done' ? 'done' : status === 'active' ? 'running' : 'queued'}
                        </span>
                      </div>
                    )
                  })}
                </div>

                {flashComplete && (
                  <div className="mt-4 rounded-xl border border-yellow-400/30 bg-yellow-300/10 p-4">
                    <div className="flex items-start gap-3">
                      <Sparkles className="mt-0.5 h-5 w-5 text-yellow-300" />
                      <div>
                        <p className="flex items-center gap-2 font-semibold text-yellow-100">
                          <CheckCircle2 className="h-4 w-4" />
                          Virtual device provisioned
                        </p>
                        <p className="mt-1 text-sm text-yellow-50/80">
                          Firmware compiled, node booted, and the simulated device is ready for a future Wokwi export flow.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {flashComplete && (
                  <div
                    key={`confetti-${confettiRunId}`}
                    className="pointer-events-none absolute inset-0 overflow-hidden"
                    aria-hidden="true"
                  >
                    {CONFETTI_PARTICLES.map((particle, index) => (
                      <motion.span
                        key={`confetti-${confettiRunId}-${index}`}
                        className="absolute top-0 h-2 w-1.5 rounded-sm"
                        style={{
                          left: `${particle.left}%`,
                          backgroundColor: particle.color,
                        }}
                        initial={{
                          y: -24,
                          x: 0,
                          opacity: 0,
                          rotate: 0,
                        }}
                        animate={{
                          y: 220 + particle.depth,
                          x: particle.drift,
                          opacity: [0, 1, 1, 0],
                          rotate: particle.rotate,
                        }}
                        transition={{
                          duration: 1.7,
                          delay: particle.delay,
                          ease: 'easeOut',
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="mb-5 rounded-lg border border-gray-800 bg-black/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Pin Assignments</p>
                  <span className="text-xs text-gray-500">{selectedBoard.label}</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {BOARD_PIN_LAYOUTS[selectedBoardId].map((pin) => {
                    const assignment = pinAssignments.find((item) => item.pin === pin)
                    return (
                      <button
                        key={pin}
                        type="button"
                        onClick={() => handlePinTileClick(pin)}
                        className={`rounded-lg border px-3 py-2 text-xs ${
                          pinMapTargetSensorId && !getPinOptionsForSensor(pinMapTargetSensorId, selectedBoardId).includes(pin)
                            ? 'border-gray-800 bg-gray-900/50 text-gray-600'
                            : assignment
                            ? 'border-esp-primary bg-esp-primary/15 text-orange-100'
                            : 'border-gray-800 bg-gray-900/80 text-gray-500'
                        }`}
                        title="Click to assign this pin in pin map mode"
                      >
                        <div className="font-semibold">{pin}</div>
                        <div className="mt-1">
                          {assignment ? assignment.sensorLabel : 'available'}
                        </div>
                        {!assignment && getPinHints(pin).length > 0 && (
                          <div className="mt-1 text-[10px] text-gray-500">
                            {getPinHints(pin).map((hint) => hint.label).join(', ')}
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              <pre className="overflow-x-auto text-sm text-green-400">
                {liveYaml}
              </pre>

              <div className="mt-4 rounded-xl border border-gray-800 bg-black/20 p-4 text-sm text-gray-400">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-medium text-gray-200">Export path</p>
                  <a
                    href="https://wokwi.com/projects/new/esphome"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center rounded-lg border border-ha-primary/40 px-3 py-1.5 text-xs font-medium text-ha-primary transition-colors hover:bg-ha-primary/10"
                  >
                    Open Wokwi
                  </a>
                </div>
                <p className="mt-2">
                  `Simulate in Wokwi` downloads starter `wokwi.toml` and `diagram.json` files from your current board and sensor wiring.
                </p>
                <p className="mt-2">
                  Use `Add to docker-compose` to copy a service snippet and keep local ESPHome + browser simulation paths aligned.
                </p>
                <ol className="mt-3 list-decimal space-y-1 pl-5 text-xs text-gray-400">
                  <li>Click `Simulate in Wokwi` to download both files.</li>
                  <li>Open Wokwi from the link above and create a new ESPHome project.</li>
                  <li>Upload `wokwi.toml` and `diagram.json`, then run the simulation.</li>
                </ol>
                {wokwiExported && (
                  <p className="mt-3 text-green-300">
                    Wokwi simulation pack exported for {normalizedDeviceName}.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function buildBuilderYaml({
  deviceName,
  board,
  pinAssignments,
  selectedScenarioYaml,
}: {
  deviceName: string
  board: BoardDefinition
  pinAssignments: Array<{ sensorId: string; pin: string }>
  selectedScenarioYaml: string | null
}) {
  const normalizedName = deviceName.trim().toLowerCase().replace(/\s+/g, '-')
  const safeName = normalizedName || 'smart-node'

  const groupedBlocks = ['sensor', 'binary_sensor', 'switch', 'output', 'display']
    .map((componentType) => {
      const entries = pinAssignments
        .map((assignment) => ({
          assignment,
          sensor: SENSOR_LOOKUP[assignment.sensorId],
        }))
        .filter((entry) => entry.sensor?.componentType === componentType)
        .map((entry) => renderSensorYaml(entry.assignment.sensorId, entry.assignment.pin))

      if (!entries.length) return null
      return `${componentType}:\n${entries.join('\n')}`
    })
    .filter(Boolean)
    .join('\n\n')

  const automationHint = selectedScenarioYaml
    ? `# Hero inspiration\n# Adapt this Home Assistant automation alongside the device config below.\n#\n${selectedScenarioYaml
        .split('\n')
        .map((line) => `# ${line}`)
        .join('\n')}\n\n`
    : ''

  return `${automationHint}esphome:
  name: ${safeName}
  friendly_name: ${toFriendlyName(safeName)}

${board.yamlTarget}:
  board: ${board.boardKey}

wifi:
  ssid: !secret wifi_ssid
  password: !secret wifi_password

logger:

api:

ota:

${groupedBlocks || '# Select sensors on the left to generate component blocks'}
`
}

function toFriendlyName(value: string) {
  return value
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function filterCompatibleSensorIds(sensorIds: string[], boardId: string) {
  const filtered = sensorIds.filter((sensorId) => isSensorCompatibleWithBoard(sensorId, boardId))
  return filtered.length === sensorIds.length ? sensorIds : filtered
}

function arePinOverridesEqual(current: PinOverrideMap, next: PinOverrideMap) {
  const currentKeys = Object.keys(current)
  const nextKeys = Object.keys(next)

  if (currentKeys.length !== nextKeys.length) return false

  return currentKeys.every((key) => current[key] === next[key])
}

function getSimulatedSensorValue(sensorId: string, tick: number, index: number) {
  switch (sensorId) {
    case 'dht22':
      return `${(22.4 + ((tick + index) % 4) * 0.6).toFixed(1)} C / ${(48 + ((tick + index) % 5) * 2).toFixed(0)}%`
    case 'ds18b20':
      return `${(19.8 + ((tick + index) % 6) * 0.4).toFixed(1)} C`
    case 'bmp280':
      return `${(1008 + ((tick + index) % 8) * 1.5).toFixed(1)} hPa`
    case 'pir':
    case 'mmwave':
      return tick % 3 === 0 ? 'Motion detected' : 'Clear'
    case 'ldr':
    case 'tsl2561':
      return `${420 + ((tick + index) % 6) * 35} lux`
    case 'soil_moisture':
      return `${42 + ((tick + index) % 5) * 3}%`
    case 'soil_ph':
      return `${(6.2 + ((tick + index) % 4) * 0.15).toFixed(2)} pH`
    case 'relay':
      return tick % 2 === 0 ? 'Relay ON' : 'Relay OFF'
    case 'led':
      return tick % 2 === 0 ? 'LED 72%' : 'LED 18%'
    case 'buzzer':
      return tick % 4 === 0 ? 'Alert pulse' : 'Idle'
    case 'button':
      return tick % 5 === 0 ? 'Pressed' : 'Released'
    case 'switch':
      return tick % 3 === 0 ? 'Switch ON' : 'Switch OFF'
    case 'potentiometer':
      return `${580 + ((tick + index) % 7) * 36} ADC`
    case 'oled':
    case 'lcd':
      return 'UI render active'
    default:
      return 'Signal stable'
  }
}

function extractNameFromTemplateYaml(templateYaml: string, fallback: string) {
  const matched = templateYaml.match(/^\s*name:\s*([a-z0-9-]+)/m)
  return matched?.[1] ?? fallback
}

function buildDockerComposeSnippet(deviceName: string) {
  const serviceName = `esphome-${deviceName}`

  return `# Add under services: in docker-compose.yml
  ${serviceName}:
    image: ghcr.io/esphome/esphome:stable
    container_name: ${serviceName}
    restart: unless-stopped
    volumes:
      - ./esphome/${deviceName}.yaml:/config/${deviceName}.yaml:ro
      - esphome_build_${deviceName}:/config/.esphome
    command: run /config/${deviceName}.yaml

# Add under volumes:
  esphome_build_${deviceName}:
`
}

function buildWokwiToml(deviceName: string) {
  return `[wokwi]
version = 1
firmware = ".esphome/build/${deviceName}/firmware.elf"
elf = ".esphome/build/${deviceName}/firmware.elf"
`
}

function buildWokwiDiagramJson(
  boardLabel: string,
  pinAssignments: Array<{ sensorId: string; pin: string }>,
) {
  return JSON.stringify(
    {
      version: 1,
      author: 'SmartHome_JustClick',
      editor: 'wokwi',
      board: boardLabel,
      parts: pinAssignments.map((assignment, index) => ({
        id: `part-${index + 1}`,
        type: assignment.sensorId,
        top: 40 + index * 28,
        left: 80,
        attrs: {
          pin: assignment.pin,
        },
      })),
      connections: pinAssignments.map((assignment, index) => [
        `part-${index + 1}:pin`,
        `board:${assignment.pin}`,
        'green',
        ['v0'],
      ]),
    },
    null,
    2,
  )
}

const CONFETTI_COLORS = ['#03A9F4', '#E8691D', '#22C55E', '#FACC15', '#F97316', '#A78BFA']

const CONFETTI_PARTICLES = Array.from({ length: 24 }, (_, index) => ({
  left: 6 + (index % 12) * 7.4,
  delay: (index % 8) * 0.045,
  depth: (index % 5) * 14,
  drift: (index % 2 === 0 ? 1 : -1) * (18 + (index % 4) * 6),
  rotate: (index % 2 === 0 ? 1 : -1) * (220 + (index % 6) * 24),
  color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
}))
