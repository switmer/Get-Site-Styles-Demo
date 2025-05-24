'use client'

import { useState, useEffect } from 'react'
import { Search, Download, Code, Palette, Settings, ExternalLink, Copy, CheckCircle } from 'lucide-react'

const API_BASE_URL = 'https://get-site-styles-api.onrender.com'
const DEMO_API_KEY = 'gss_mb1r5n49_918ec955cf99e9bd8aba34c790659eeb'

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
      const response = await fetch(`${API_BASE_URL}/api/v1/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': DEMO_API_KEY
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

  const formatResultDisplay = () => {
    if (!result) return ''
    
    if (format === 'shadcn') {
      return result.data.css || JSON.stringify(result.data, null, 2)
    }
    
    return JSON.stringify(result.data, null, 2)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/70 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Palette className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Get-Site-Styles API
              </h1>
            </div>
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
              LIVE DEMO
            </span>
          </div>
          <p className="text-gray-600 mt-2">
            Extract design tokens from any website and convert them to your preferred format
          </p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Panel */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center gap-2 mb-4">
                <Search className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold">Website Analysis</h2>
              </div>

              {/* URL Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Website URL</label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="flex flex-wrap gap-2">
                  {exampleUrls.map((exampleUrl) => (
                    <button
                      key={exampleUrl}
                      onClick={() => setUrl(exampleUrl)}
                      className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
                    >
                      {exampleUrl.replace('https://', '')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Format Selection */}
              <div className="space-y-2 mt-4">
                <label className="text-sm font-medium text-gray-700">Output Format</label>
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
                        <div className="text-xs text-gray-500">{option.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Options */}
              <div className="space-y-4 mt-6 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-gray-600" />
                  <h3 className="font-medium text-sm">Options</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Color Format</label>
                    <select
                      value={colorFormat}
                      onChange={(e) => setColorFormat(e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      <span className="text-sm font-medium text-gray-700">Compact Output</span>
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
                    <Download className="w-4 h-4" />
                    Analyze Website
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results Panel */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center gap-2 mb-4">
                <Code className="w-5 h-5 text-green-600" />
                <h2 className="text-lg font-semibold">Results</h2>
              </div>

              {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-md mb-4">
                  <p className="font-medium">Error:</p>
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {result && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ExternalLink className="w-5 h-5 text-purple-600" />
                      <span className="font-medium text-sm">
                        {new URL(result.input.url).hostname}
                      </span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(formatResultDisplay())}
                      className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm"
                    >
                      {copied ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>

                  <div className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-auto max-h-96">
                    <pre className="text-sm">{formatResultDisplay()}</pre>
                  </div>

                  {/* Color Preview */}
                  {result.data?.colors && (
                    <div className="mt-4">
                      <h4 className="font-medium text-sm mb-2">Color Palette Preview</h4>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(result.data.colors).slice(0, 12).map(([name, value]) => (
                          <div key={name} className="flex flex-col items-center">
                            <div
                              className="w-8 h-8 rounded border shadow-sm"
                              style={{ backgroundColor: String(value) }}
                              title={`${name}: ${String(value)}`}
                            />
                            <span className="text-xs text-gray-600 mt-1 max-w-16 truncate">
                              {name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!result && !loading && !error && (
                <div className="text-center py-12">
                  <Palette className="w-12 h-12 mb-4 text-gray-300 mx-auto" />
                  <p className="text-gray-500 mb-2">No analysis yet</p>
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
