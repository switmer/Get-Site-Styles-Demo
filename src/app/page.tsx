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
            {/* Color Palette */}
            {colors.length > 0 && (
              <div className="max-w-6xl mx-auto px-4">
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 p-8">
                  <div className="flex items-center gap-2 mb-6">
                    <IconPalette className="w-6 h-6 text-blue-600" />
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Color Palette</h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {colors.map(([name, color]) => (
                      <div
                        key={name}
                        className="group cursor-pointer"
                        onClick={() => copyToClipboard(color, `color-${name}`)}
                      >
                        <div
                          className="w-full aspect-square rounded-lg border-2 border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-all group-hover:scale-105"
                          style={{ backgroundColor: String(color) }}
                          title={`${name}: ${String(color)}`}
                        />
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mt-2 truncate">{name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{String(color).substring(0, 15)}</p>
                        {copied === `color-${name}` && (
                          <p className="text-xs text-green-600 dark:text-green-400 font-semibold mt-1">Copied!</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Component Preview */}
            <div className="max-w-6xl mx-auto px-4">
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 p-8">
                <div className="flex items-center gap-2 mb-6">
                  <IconLayers className="w-6 h-6 text-purple-600" />
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Component Preview</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Primary Button */}
                  <div>
                    <p className="text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 font-semibold mb-3">Button</p>
                    <style>{`
                      .preview-btn {
                        background-color: ${colors[0]?.[1] || '#3b82f6'};
                        color: white;
                      }
                    `}</style>
                    <button className="preview-btn px-6 py-2 rounded-lg font-semibold transition-opacity hover:opacity-90">
                      Get Started
                    </button>
                  </div>

                  {/* Card */}
                  <div>
                    <p className="text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 font-semibold mb-3">Card</p>
                    <div
                      className="p-4 rounded-lg border"
                      style={{
                        backgroundColor: colors[0]?.[1] ? `${colors[0][1]}15` : '#f3f4f6',
                        borderColor: colors[0]?.[1] || '#e5e7eb'
                      }}
                    >
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Design Token</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Extracted from {result.input?.url ? new URL(result.input.url).hostname : 'website'}
                      </p>
                    </div>
                  </div>

                  {/* Text Styles */}
                  <div>
                    <p className="text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 font-semibold mb-3">Heading</p>
                    <h3 className="text-3xl font-bold" style={{ color: colors[0]?.[1] || '#1f2937' }}>
                      Beautiful Typography
                    </h3>
                  </div>

                  {/* Badge */}
                  <div>
                    <p className="text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 font-semibold mb-3">Badge</p>
                    <span
                      className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-white"
                      style={{ backgroundColor: colors[1]?.[1] || '#8b5cf6' }}
                    >
                      Design System
                    </span>
                  </div>
                </div>
              </div>
            </div>

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
