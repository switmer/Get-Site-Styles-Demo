'use client'

// Force redeploy - Updated with full demo interface
import { useState, useEffect } from 'react'
import {
  Search,
  Download,
  Code,
  Palette,
  Settings,
  ExternalLink,
  Copy,
  CheckCircle
} from 'lucide-react'
import ThemeToggle from '@/components/ThemeToggle'

// Type assertion for React 19 compatibility
const IconPalette = Palette as React.FC<{ className?: string }>
const IconSearch = Search as React.FC<{ className?: string }>
const IconDownload = Download as React.FC<{ className?: string }>
const IconCode = Code as React.FC<{ className?: string }>
const IconSettings = Settings as React.FC<{ className?: string }>
const IconExternalLink = ExternalLink as React.FC<{ className?: string }>
const IconCopy = Copy as React.FC<{ className?: string }>
const IconCheckCircle = CheckCircle as React.FC<{ className?: string }>


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
  const [format, setFormat] = useState('shadcn')
  const [colorFormat, setColorFormat] = useState('hsl')
  const [compact, setCompact] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Handle client-side mounting to prevent hydration mismatches
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
    </div>
  }

  const formatOptions = [
    { value: 'shadcn', label: 'shadcn/ui Theme', description: 'Ready-to-use CSS variables for shadcn/ui' },
    { value: 'tailwind', label: 'Tailwind Config', description: 'Tailwind CSS configuration object' },
    { value: 'json', label: 'Raw JSON', description: 'Complete token data in JSON format' },
    { value: 'style-dictionary', label: 'Style Dictionary', description: 'Design tokens for Style Dictionary' },
    { value: 'theme-json', label: 'Theme JSON', description: 'WordPress-compatible theme.json format' }
  ]

  const colorFormatOptions = [
    { value: 'hsl', label: 'HSL' },
    { value: 'hex', label: 'HEX' },
    { value: 'oklch', label: 'OKLCH' }
  ]

  const exampleUrls = [
    'https://stripe.com',
    'https://github.com',
    'https://vercel.com',
    'https://netflix.com',
    'https://discord.com'
  ]

  const analyzeWebsite = async () => {
    if (!url) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url,
          format,
          colorFormat,
          compact
        })
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const colorRegex = /^(#([0-9a-fA-F]{3,8})|rgba?\(|hsla?\(|oklch\(|lab\(|lch\()/

  function isRecord(v: unknown): v is Record<string, unknown> {
    return typeof v === 'object' && v !== null && !Array.isArray(v)
  }

  function deriveColors(data: unknown): Record<string, string> {
    if (!data || !isRecord(data)) return {}

    // Case 1: direct map at data.colors
    if (isRecord(data.colors)) {
      const entries = Object.entries(data.colors).filter(([, v]) => typeof v === 'string' && colorRegex.test(String(v))) as Array<[string, string]>
      if (entries.length) return Object.fromEntries(entries)
    }

    // Case 2: tokens.colors array
    const tokens = isRecord(data.tokens) ? data.tokens : undefined
    const tokenArray = Array.isArray(tokens?.colors) ? (tokens!.colors as unknown[]) : null
    if (Array.isArray(tokenArray) && tokenArray.length) {
      const arr = tokenArray.filter((v): v is string => typeof v === 'string')
      return Object.fromEntries(arr.slice(0, 48).map((v, i) => [
        `color-${String(i + 1).padStart(2, '0')}`,
        v,
      ]))
    }

    // Case 3: theme variables (light or dark)
    const theme = isRecord(data.theme) ? data.theme : undefined
    const themeLight = isRecord(theme?.light) ? (theme!.light as Record<string, unknown>) : (theme as Record<string, unknown> | undefined)
    if (themeLight) {
      const themed = Object.entries(themeLight)
        .filter(([k, v]) => typeof v === 'string' && colorRegex.test(String(v)) && /^(--|primary|secondary|accent|muted|foreground|background|border|ring|chart)/.test(k))
        .slice(0, 48) as Array<[string, string]>
      if (themed.length) return Object.fromEntries(themed)
    }

    // Case 4: parse CSS string for custom properties
    if (typeof (data as Record<string, unknown>).css === 'string') {
      const css = String((data as Record<string, unknown>).css)
      const matches = Array.from(css.matchAll(/--([a-z0-9-]+):\s*([^;]+);/gi))
      const picked = matches
        .map((m) => [`--${m[1]}`, m[2].trim()] as const)
        .filter(([, v]) => colorRegex.test(v))
        .slice(0, 48)
      if (picked.length) return Object.fromEntries(picked)
    }

    // Case 5: colorAnalysis array
    const analysis = (data as Record<string, unknown>).colorAnalysis
    if (Array.isArray(analysis) && analysis.length) {
      const arr = (analysis as unknown[])
        .map((c) => (typeof c === 'string' ? c : (isRecord(c) && typeof c.color === 'string') ? c.color : undefined))
        .filter((v): v is string => typeof v === 'string' && colorRegex.test(v))
        .slice(0, 48)
      if (arr.length) {
        return Object.fromEntries(arr.map((v, i) => [
          `color-${String(i + 1).padStart(2, '0')}`,
          v,
        ]))
      }
    }

    return {}
  }

  const formatResultDisplay = () => {
    if (!result) return ''

    if (format === 'shadcn') {
      return result.data.css || JSON.stringify(result.data, null, 2)
    }

    return JSON.stringify(result.data, null, 2)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-950">
      {/* Header */}
      <header className="border-b bg-white/70 backdrop-blur-sm dark:bg-gray-900/70 dark:border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <IconPalette className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent dark:from-gray-100 dark:to-gray-400">
                  Get-Site-Styles API
                </h1>
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full dark:bg-green-900/40 dark:text-green-300">
                LIVE DEMO
              </span>
            </div>
            {/* Theme toggle */}
            <ThemeToggle />
          </div>
          <p className="text-gray-600 mt-2 dark:text-gray-300">
            Extract design tokens from any website and convert them to your preferred format
          </p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Panel */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6 dark:bg-gray-900 dark:border-gray-800">
              <div className="flex items-center gap-2 mb-4">
                <IconSearch className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold">Website Analysis</h2>
              </div>

              {/* URL Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Website URL</label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 placeholder:text-gray-400"
                />
                <div className="flex flex-wrap gap-2">
                  {exampleUrls.map((exampleUrl) => (
                    <button
                      key={exampleUrl}
                      onClick={() => setUrl(exampleUrl)}
                      className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      {exampleUrl.replace('https://', '')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Format Selection */}
              <div className="space-y-2 mt-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Output Format</label>
                <div className="space-y-2">
                  {formatOptions.map((option) => (
                    <label key={option.value} className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="format"
                        value={option.value}
                        checked={format === option.value}
                        onChange={(e) => setFormat(e.target.value)}
                        className="mt-0.5"
                      />
                      <div>
                        <div className="font-medium text-sm">{option.label}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{option.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Options */}
              <div className="space-y-4 mt-6 pt-4 border-t dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <IconSettings className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                  <h3 className="font-medium text-sm">Options</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Color Format</label>
                    <select
                      value={colorFormat}
                      onChange={(e) => setColorFormat(e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                    >
                      {colorFormatOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={compact}
                        onChange={(e) => setCompact(e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Compact Output</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Analyze Button */}
              <button
                onClick={analyzeWebsite}
                disabled={loading || !url}
                className="w-full mt-6 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <IconDownload className="w-4 h-4" />
                    Analyze Website
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results Panel */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6 dark:bg-gray-900 dark:border-gray-800">
              <div className="flex items-center gap-2 mb-4">
                <IconCode className="w-5 h-5 text-green-600" />
                <h2 className="text-lg font-semibold">Results</h2>
              </div>

              {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-md mb-4 dark:bg-red-900/30 dark:text-red-300">
                  <p className="font-medium">Error:</p>
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {result && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <IconExternalLink className="w-5 h-5 text-purple-600" />
                      <span className="font-medium text-sm">
                        {result.input?.url ? new URL(result.input.url).hostname : 'Unknown'}
                      </span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(formatResultDisplay())}
                      className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                    >
                      {copied ? <IconCheckCircle className="w-4 h-4 text-green-600" /> : <IconCopy className="w-4 h-4" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>

                  <div className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-auto max-h-96">
                    <pre className="text-sm">{formatResultDisplay()}</pre>
                  </div>

                  {/* Color Preview */}
                  {(() => {
                    const palette = deriveColors(result.data)
                    const entries = Object.entries(palette).slice(0, 24)
                    if (!entries.length) return null
                    return (
                      <div className="mt-4">
                        <h4 className="font-medium text-sm mb-2">Color Palette Preview</h4>
                        <div className="flex flex-wrap gap-2">
                          {entries.map(([name, value]) => (
                            <div key={name} className="flex flex-col items-center">
                              <div
                                className="w-8 h-8 rounded border shadow-sm"
                                style={{ backgroundColor: String(value) }}
                                title={`${name}: ${String(value)}`}
                              />
                              <span className="text-xs text-gray-600 dark:text-gray-400 mt-1 max-w-16 truncate">
                                {name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })()}
                </div>
              )}

              {!result && !loading && !error && (
                <div className="text-center py-12">
                  <IconPalette className="w-12 h-12 mb-4 text-gray-300 mx-auto" />
                  <p className="text-gray-500 mb-2 dark:text-gray-400">No analysis yet</p>
                  <p className="text-sm text-gray-400">
                    Enter a URL and click &quot;Analyze Website&quot; to extract design tokens
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
