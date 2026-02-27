'use client'

import { useState, useEffect } from 'react'
import {
  Search,
  Zap,
  Palette,
  Copy,
  CheckCircle,
  ChevronDown,
  Code2,
  Smartphone,
  Layers,
  ExternalLink
} from 'lucide-react'
import ThemeToggle from '@/components/ThemeToggle'

const IconSearch = Search as React.FC<{ className?: string }>
const IconZap = Zap as React.FC<{ className?: string }>
const IconPalette = Palette as React.FC<{ className?: string }>
const IconCopy = Copy as React.FC<{ className?: string }>
const IconCheckCircle = CheckCircle as React.FC<{ className?: string }>
const IconChevronDown = ChevronDown as React.FC<{ className?: string }>
const IconCode = Code2 as React.FC<{ className?: string }>
const IconSmartphone = Smartphone as React.FC<{ className?: string }>
const IconLayers = Layers as React.FC<{ className?: string }>
const IconExternalLink = ExternalLink as React.FC<{ className?: string }>

interface AnalysisResult {
  data: {
    css?: string
    colors?: Record<string, string>
    [key: string]: unknown
  }
  input: {
    url: string
    [key: string]: unknown
  }
  [key: string]: unknown
}

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [url, setUrl] = useState('https://stripe.com')
  const [useCase, setUseCase] = useState('design-system')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [colorFormat, setColorFormat] = useState('hsl')
  const [format, setFormat] = useState('json')

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
    </div>
  }

  const useCases = [
    { id: 'design-system', label: 'Design System', icon: '🎨', desc: 'Complete tokens & variables' },
    { id: 'ui-kit', label: 'UI Kit', icon: '📦', desc: 'Components & patterns' },
    { id: 'tailwind', label: 'Tailwind', icon: '⚡', desc: 'Config ready to use' },
    { id: 'figma', label: 'Figma Plugin', icon: '✨', desc: 'Variables & styles' },
    { id: 'web-app', label: 'Web App', icon: '💻', desc: 'CSS for your app' }
  ]

  const presets = [
    { name: 'Stripe', url: 'https://stripe.com' },
    { name: 'GitHub', url: 'https://github.com' },
    { name: 'Vercel', url: 'https://vercel.com' },
    { name: 'Discord', url: 'https://discord.com' },
    { name: 'Netflix', url: 'https://netflix.com' }
  ]

  const extractTokens = async () => {
    if (!url) return
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          format,
          colorFormat,
          compact: false
        })
      })

      if (!response.ok) throw new Error(`API Error: ${response.status}`)
      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Extraction failed')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string, id: string) => {
    const legacyCopy = () => {
      try {
        const textarea = document.createElement('textarea')
        textarea.value = text
        textarea.setAttribute('readonly', '')
        textarea.style.position = 'fixed'
        textarea.style.top = '-9999px'
        document.body.appendChild(textarea)
        textarea.focus()
        textarea.select()
        const ok = document.execCommand('copy')
        document.body.removeChild(textarea)
        return ok
      } catch {
        return false
      }
    }

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text)
      } else {
        const ok = legacyCopy()
        if (!ok) throw new Error('Copy blocked')
      }
      setCopied(id)
      setTimeout(() => setCopied(null), 2000)
    } catch (e) {
      setError('Copy blocked by browser. Use Ctrl/Cmd+C to copy selected text.')
    }
  }

  const colorRegex = /^(#([0-9a-fA-F]{3,8})|rgba?\(|hsla?\(|oklch\(|lab\(|lch\()/

  const tokenValueToString = (val: any): string => {
    if (typeof val === 'string') return val
    if (typeof val === 'number') return String(val)
    if (val && typeof val === 'object' && val.value) return String(val.value)
    if (val && typeof val === 'object') return JSON.stringify(val)
    return String(val)
  }

  const extractColors = (data: any): Array<[string, string]> => {
    if (!data) return []
    if (data.colors && typeof data.colors === 'object' && !Array.isArray(data.colors)) {
      const entries = Object.entries(data.colors).filter(([, v]) => typeof v === 'string' && colorRegex.test(String(v)))
      if (entries.length) return entries as Array<[string, string]>
    }
    const tokenArray = data.tokens?.colors
    if (Array.isArray(tokenArray) && tokenArray.length) {
      return tokenArray.slice(0, 24).map((v: string, i: number) => [
        `color-${String(i + 1).padStart(2, '0')}`,
        v,
      ])
    }
    const themeVars = (data.theme?.light ?? data.theme ?? {}) as Record<string, string>
    const themed = Object.entries(themeVars)
      .filter(([k, v]) => typeof v === 'string' && colorRegex.test(v) && /^(--|primary|secondary|accent|muted|foreground|background|border|ring|chart)/.test(k))
      .slice(0, 24)
    if (themed.length) return themed as Array<[string, string]>
    if (typeof data.css === 'string') {
      const matches = Array.from(data.css.matchAll(/--([a-z0-9-]+):\s*([^;]+);/gi))
      const picked = matches
        .map((m) => [`--${m[1]}`, m[2].trim()] as const)
        .filter(([, v]) => colorRegex.test(v))
        .slice(0, 24)
      if (picked.length) return picked
    }
    const analysis = data?.colorAnalysis
    if (Array.isArray(analysis) && analysis.length) {
      return analysis.slice(0, 24).map((c: any, i: number) => [
        `color-${String(i + 1).padStart(2, '0')}`,
        typeof c === 'string' ? c : c?.color,
      ]).filter(([, v]) => typeof v === 'string' && colorRegex.test(v))
    }
    return []
  }

  const formatResultDisplay = () => {
    if (!result) return ''
    if (format === 'shadcn') {
      return result.data.css || JSON.stringify(result.data, null, 2)
    }
    return JSON.stringify(result.data, null, 2)
  }

  const colors = result ? extractColors(result.data) : []

  const extractAllTokens = (data: any) => {
    const tokens: Record<string, any> = {
      colors: {},
      typography: {},
      spacing: {},
      radii: {},
      shadows: {},
      other: {}
    }

    if (!data) return tokens

    // Extract all tokens from CSS variables
    if (typeof data.css === 'string') {
      const matches = Array.from(data.css.matchAll(/--([a-z0-9-]+):\s*([^;]+);/gi))
      matches.forEach(([, name, value]) => {
        const key = `--${name}`
        const trimmedValue = value.trim()

        if (colorRegex.test(trimmedValue)) {
          tokens.colors[key] = trimmedValue
        } else if (/^[0-9.]+px|^[0-9.]+rem|^[0-9.]+em/.test(trimmedValue)) {
          if (/radius|border-radius/.test(name)) {
            tokens.radii[key] = trimmedValue
          } else {
            tokens.spacing[key] = trimmedValue
          }
        } else if (/shadow|0\s+[0-9]/.test(trimmedValue)) {
          tokens.shadows[key] = trimmedValue
        } else if (/font|sans|serif|mono|family/.test(name)) {
          tokens.typography[key] = trimmedValue
        } else {
          tokens.other[key] = trimmedValue
        }
      })
    }

    // Extract from structured tokens
    if (data.tokens) {
      // Handle colors with values/frequency structure
      if (data.tokens.colors) {
        if (data.tokens.colors.values && Array.isArray(data.tokens.colors.values)) {
          Object.assign(tokens.colors, Object.fromEntries(
            data.tokens.colors.values.map((c: string, i: number) => [`color-${i + 1}`, c])
          ))
        } else if (Array.isArray(data.tokens.colors)) {
          Object.assign(tokens.colors, Object.fromEntries(
            data.tokens.colors.map((c: string, i: number) => [`color-${i + 1}`, c])
          ))
        } else if (typeof data.tokens.colors === 'object') {
          Object.assign(tokens.colors, data.tokens.colors)
        }
      }

      // Handle spacing with values/frequency structure
      if (data.tokens.spacing) {
        if (data.tokens.spacing.values && Array.isArray(data.tokens.spacing.values)) {
          Object.assign(tokens.spacing, Object.fromEntries(
            data.tokens.spacing.values.map((s: string, i: number) => [`spacing-${i + 1}`, s])
          ))
        } else if (Array.isArray(data.tokens.spacing)) {
          Object.assign(tokens.spacing, Object.fromEntries(
            data.tokens.spacing.map((s: string, i: number) => [`spacing-${i + 1}`, s])
          ))
        } else if (typeof data.tokens.spacing === 'object') {
          Object.assign(tokens.spacing, data.tokens.spacing)
        }
      }

      // Handle font sizes
      if (data.tokens.fontSizes) {
        if (data.tokens.fontSizes.values && Array.isArray(data.tokens.fontSizes.values)) {
          Object.assign(tokens.typography, Object.fromEntries(
            data.tokens.fontSizes.values.map((f: string, i: number) => [`font-size-${i + 1}`, f])
          ))
        }
      }

      // Handle typography
      if (data.tokens.typography) {
        if (typeof data.tokens.typography === 'object' && !Array.isArray(data.tokens.typography)) {
          Object.entries(data.tokens.typography).forEach(([key, value]) => {
            tokens.typography[key] = tokenValueToString(value)
          })
        }
      }

      // Handle border radius
      if (data.tokens.radii) {
        if (data.tokens.radii.values && Array.isArray(data.tokens.radii.values)) {
          Object.assign(tokens.radii, Object.fromEntries(
            data.tokens.radii.values.map((r: string, i: number) => [`radius-${i + 1}`, r])
          ))
        } else if (typeof data.tokens.radii === 'object' && !Array.isArray(data.tokens.radii)) {
          Object.assign(tokens.radii, data.tokens.radii)
        }
      }

      // Handle shadows
      if (data.tokens.shadows) {
        if (data.tokens.shadows.values && Array.isArray(data.tokens.shadows.values)) {
          Object.assign(tokens.shadows, Object.fromEntries(
            data.tokens.shadows.values.map((s: string, i: number) => [`shadow-${i + 1}`, s])
          ))
        } else if (typeof data.tokens.shadows === 'object' && !Array.isArray(data.tokens.shadows)) {
          Object.entries(data.tokens.shadows).forEach(([key, value]) => {
            tokens.shadows[key] = tokenValueToString(value)
          })
        }
      }
    }

    // Extract from theme
    if (data.theme) {
      const theme = data.theme.light || data.theme.dark || data.theme
      Object.entries(theme as Record<string, any>).forEach(([key, value]) => {
        if (typeof value !== 'string') return
        if (colorRegex.test(value)) {
          tokens.colors[key] = value
        } else if (/radius|border-radius/.test(key)) {
          tokens.radii[key] = value
        } else if (/font|family|size|weight/.test(key)) {
          tokens.typography[key] = value
        } else if (/shadow/.test(key)) {
          tokens.shadows[key] = value
        } else if (/^[0-9.]+/.test(value)) {
          tokens.spacing[key] = value
        } else {
          tokens.other[key] = value
        }
      })
    }

    return tokens
  }

  const allTokens = result ? extractAllTokens(result.data) : { colors: {}, typography: {}, spacing: {}, radii: {}, shadows: {}, other: {} }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Header */}
      <header className="border-b bg-white/50 backdrop-blur-sm dark:bg-gray-900/50 dark:border-gray-800 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <IconZap className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent dark:from-gray-100 dark:to-gray-400">
              Design Tokens
            </h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="w-full py-12">
        {/* Hero */}
        <div className="max-w-4xl mx-auto px-4 mb-12 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
            Extract Design Tokens from Any Website
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Analyze color palettes, typography, spacing, and more. Get tokens ready for your design system, UI kit, or framework.
          </p>
        </div>

        {/* Main Input */}
        <div className="max-w-4xl mx-auto px-4 mb-8">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 p-6 space-y-6">
            {/* URL Input */}
            <div>
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-200 block mb-3">Website URL</label>
              <div className="relative">
                <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
                />
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {presets.map((p) => (
                  <button
                    key={p.url}
                    onClick={() => setUrl(p.url)}
                    className="text-xs px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Use Case Selection */}
            <div>
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-200 block mb-3">What Are You Building?</label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {useCases.map((uc) => (
                  <button
                    key={uc.id}
                    onClick={() => setUseCase(uc.id)}
                    className={`p-3 rounded-lg border-2 transition-all text-center ${
                      useCase === uc.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="text-2xl mb-1">{uc.icon}</div>
                    <div className="text-xs font-semibold text-gray-900 dark:text-gray-100">{uc.label}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{uc.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Advanced Options */}
            <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-gray-100"
              >
                <IconChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
                Advanced Options
              </button>
              {showAdvanced && (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-2">Export Format</label>
                    <select
                      value={format}
                      onChange={(e) => setFormat(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
                    >
                      <option value="shadcn">shadcn/ui Theme</option>
                      <option value="tailwind">Tailwind Config</option>
                      <option value="json">Raw JSON</option>
                      <option value="style-dictionary">Style Dictionary</option>
                      <option value="theme-json">Theme JSON</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-2">Color Format</label>
                    <select
                      value={colorFormat}
                      onChange={(e) => setColorFormat(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
                    >
                      <option value="hsl">HSL</option>
                      <option value="hex">HEX</option>
                      <option value="oklch">OKLCH</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Extract Button */}
            <button
              onClick={extractTokens}
              disabled={loading || !url}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <IconZap className="w-5 h-5" />
                  Extract Tokens
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="max-w-4xl mx-auto px-4 mb-8 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg">
            <p className="font-semibold mb-1">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-8">
            {/* Color Tokens */}
            {Object.keys(allTokens.colors).length > 0 && (
              <div className="max-w-6xl mx-auto px-4">
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 p-8">
                  <div className="flex items-center gap-2 mb-6">
                    <IconPalette className="w-6 h-6 text-blue-600" />
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Color Tokens ({Object.keys(allTokens.colors).length})</h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {Object.entries(allTokens.colors).slice(0, 48).map(([name, color]) => (
                      <div
                        key={name}
                        className="group cursor-pointer"
                        onClick={() => copyToClipboard(`${color}`, `color-${name}`)}
                      >
                        <div
                          className="w-full aspect-square rounded-lg border-2 border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-all group-hover:scale-105"
                          style={{ backgroundColor: String(color) }}
                          title={`${name}: ${String(color)}`}
                        />
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mt-2 truncate">{name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{String(color).substring(0, 14)}</p>
                        {copied === `color-${name}` && (
                          <p className="text-xs text-green-600 dark:text-green-400 font-semibold mt-1">✓</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Typography Tokens */}
            {Object.keys(allTokens.typography).length > 0 && (
              <div className="max-w-6xl mx-auto px-4">
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 p-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Typography Tokens ({Object.keys(allTokens.typography).length})</h3>
                  <div className="space-y-3">
                    {Object.entries(allTokens.typography).slice(0, 16).map(([name, value]) => {
                      const valStr = tokenValueToString(value)
                      return (
                      <div
                        key={name}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer group"
                        onClick={() => copyToClipboard(valStr, `typo-${name}`)}
                      >
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{valStr.substring(0, 40)}</p>
                        </div>
                        {copied === `typo-${name}` ? (
                          <IconCheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 ml-4" />
                        ) : (
                          <IconCopy className="w-5 h-5 text-gray-400 dark:text-gray-500 ml-4 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                        )}
                      </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Spacing Tokens */}
            {Object.keys(allTokens.spacing).length > 0 && (
              <div className="max-w-6xl mx-auto px-4">
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 p-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Spacing Tokens ({Object.keys(allTokens.spacing).length})</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(allTokens.spacing).slice(0, 24).map(([name, value]) => {
                      const valStr = tokenValueToString(value)
                      return (
                      <div
                        key={name}
                        className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer group"
                        onClick={() => copyToClipboard(valStr, `spacing-${name}`)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{valStr}</p>
                          </div>
                          {copied === `spacing-${name}` ? (
                            <IconCheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                          ) : (
                            <IconCopy className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                          )}
                        </div>
                        <div
                          className="h-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                          style={{ width: `${Math.min(parseInt(valStr) || 10, 100)}px` }}
                        />
                      </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Border Radius Tokens */}
            {Object.keys(allTokens.radii).length > 0 && (
              <div className="max-w-6xl mx-auto px-4">
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 p-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Border Radius Tokens ({Object.keys(allTokens.radii).length})</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {Object.entries(allTokens.radii).slice(0, 16).map(([name, value]) => {
                      const valStr = tokenValueToString(value)
                      return (
                      <div
                        key={name}
                        className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer group"
                        onClick={() => copyToClipboard(valStr, `radius-${name}`)}
                      >
                        <div
                          className="w-16 h-16 mx-auto mb-3 bg-blue-500 border-2 border-gray-300 dark:border-gray-600"
                          style={{ borderRadius: valStr }}
                        />
                        <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">{name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{valStr}</p>
                        {copied === `radius-${name}` && (
                          <p className="text-xs text-green-600 dark:text-green-400 font-semibold mt-1">✓</p>
                        )}
                      </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Shadow Tokens */}
            {Object.keys(allTokens.shadows).length > 0 && (
              <div className="max-w-6xl mx-auto px-4">
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 p-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Shadow Tokens ({Object.keys(allTokens.shadows).length})</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(allTokens.shadows).slice(0, 12).map(([name, value]) => {
                      const valStr = tokenValueToString(value)
                      return (
                      <div
                        key={name}
                        className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer group"
                        onClick={() => copyToClipboard(valStr, `shadow-${name}`)}
                      >
                        <div
                          className="w-full h-20 rounded-lg bg-white dark:bg-gray-700 mb-3"
                          style={{ boxShadow: valStr }}
                        />
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-mono truncate">{valStr.substring(0, 40)}</p>
                        {copied === `shadow-${name}` && (
                          <p className="text-xs text-green-600 dark:text-green-400 font-semibold mt-1">✓</p>
                        )}
                      </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Raw Export */}
            <div className="max-w-6xl mx-auto px-4">
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <IconCode className="w-6 h-6 text-green-600" />
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Export Code</h3>
                  </div>
                  <button
                    onClick={() => copyToClipboard(formatResultDisplay(), 'code')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
                      copied === 'code'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {copied === 'code' ? <IconCheckCircle className="w-4 h-4" /> : <IconCopy className="w-4 h-4" />}
                    {copied === 'code' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <div className="bg-gray-950 text-gray-100 p-4 rounded-lg overflow-auto max-h-96 font-mono text-sm">
                  <pre>{formatResultDisplay()}</pre>
                </div>
              </div>
            </div>

            {/* Links */}
            <div className="max-w-6xl mx-auto px-4">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <IconExternalLink className="w-4 h-4" />
                <a href={url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 dark:hover:text-blue-400">
                  View analyzed website
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!result && !loading && !error && (
          <div className="max-w-4xl mx-auto px-4 text-center py-12">
            <IconPalette className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-700" />
            <p className="text-lg text-gray-500 dark:text-gray-400">
              Enter a website URL above to extract design tokens
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
