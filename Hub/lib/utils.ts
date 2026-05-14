/**
 * Utility Functions
 * 
 * Helper functions for common operations
 */

/**
 * Download text file to user's computer
 */
export const downloadFile = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/plain' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    console.error('Failed to copy:', err)
    return false
  }
}

/**
 * Generate YAML from builder state
 */
export const generateYaml = (config: {
  name: string
  board: string
  sensors: string[]
  ssid?: string
}): string => {
  const baseYaml = `esphome:
  name: ${config.name.toLowerCase().replace(/\s+/g, '-')}

esp32:
  board: ${config.board}

wifi:
  ssid: !secret wifi_ssid
  password: !secret wifi_password
`

  let sensorYaml = ''
  if (config.sensors.length > 0) {
    sensorYaml = `
sensor:
  # Add your sensors here
`
  }

  return `${baseYaml}${sensorYaml}
api:
homeassistant:
`
}

/**
 * Generate Python skill code
 */
export const generatePythonSkill = (config: {
  skillName: string
  description: string
  triggers: string[]
  actions: string[]
}): string => {
  const className = config.skillName
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('')

  return `#!/usr/bin/env python3
# Auto-generated OpenClaw Skill
# Name: ${config.skillName}
# Description: ${config.description}

from openclaw import BaseTool

class ${className}(BaseTool):
    """${config.description}"""
    
    def __init__(self, hass):
        self.hass = hass
        self.triggers = ${JSON.stringify(config.triggers)}
        self.actions = ${JSON.stringify(config.actions)}
    
    async def async_execute(self, data: dict) -> dict:
        """Execute the skill"""
        # TODO: Implement skill logic
        return {"status": "success"}
`
}

/**
 * Format code with syntax highlighting (returns HTML)
 */
export const formatCode = (code: string, language: string = 'yaml'): string => {
  // This is a placeholder - in real implementation, use highlight.js
  return `<pre><code class="language-${language}">${code}</code></pre>`
}

/**
 * Validate YAML syntax (basic check)
 */
export const validateYaml = (yaml: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = []

  if (!yaml.trim()) {
    errors.push('YAML content is empty')
  }

  // Basic indentation check
  const lines = yaml.split('\n')
  for (const [idx, line] of lines.entries()) {
    if (!line.trim()) continue

    const match = line.match(/^(\s*)/)
    const indent = match ? match[1].length : 0

    if (indent % 2 !== 0) {
      errors.push(`Line ${idx + 1}: Invalid indentation (must be multiple of 2)`)
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors }
  }

  return { valid: true, errors: [] }
}

/**
 * Generate ClawHub install command
 */
export const generateClawHubCommand = (username: string, skillName: string): string => {
  const formatted = skillName.toLowerCase().replace(/\s+/g, '-')
  return `clawhub install ${username}/${formatted}`
}

/**
 * Get GitHub stats (mock implementation)
 */
export const fetchGithubStats = async (): Promise<{ stars: number; forks: number }> => {
  // In production, this would fetch from GitHub API
  // For now, return mock data
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ stars: 245, forks: 42 })
    }, 1000)
  })
}

/**
 * Convert hex color to RGB
 */
export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    }
    : null
}

/**
 * Debounce function for input handlers
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }

    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}
