import React from 'react';
import { PaletteIcon, TypeIcon, RulerIcon, CircleIcon, ScalingIcon } from 'lucide-react';

type FrequencyEntry = { value: string; count: number; prevalence: number };
type TokenField =
  | string[]
  | { values?: string[]; frequency?: FrequencyEntry[] }
  | undefined;

interface TokenExplorerProps {
  analysisData: {
    meta?: { source?: string };
    data?: {
      tokens?: {
        colors?: TokenField;
        fontFamilies?: TokenField;
        fontSizes?: TokenField;
        fontWeights?: TokenField;
        lineHeights?: TokenField;
        letterSpacings?: TokenField;
        spacing?: TokenField;
        radii?: TokenField;
        customProperties?: Record<string, unknown>;
      };
    };
  } | null;
}

// Normalize both shapes:
//   shadcn format: tokens.fontFamilies = ["DM Sans", "Inter", ...]
//   json format:   tokens.fontFamilies = { values: [...], frequency: [{value, count, prevalence}] }
function normalizeField(field: TokenField): Array<{ value: string; count?: number; prevalence?: number }> {
  if (!field) return [];
  if (Array.isArray(field)) return field.map(v => ({ value: String(v) }));
  if (field.frequency && field.frequency.length) return field.frequency;
  if (field.values && field.values.length) return field.values.map(v => ({ value: String(v) }));
  return [];
}

// Filter unresolved var() expressions — they're not useful to display and would
// confuse a reader expecting concrete values.
function filterResolved(entries: Array<{ value: string; count?: number; prevalence?: number }>) {
  return entries.filter(e => !/\bvar\(/.test(e.value));
}

const FrequencyRow: React.FC<{ entry: { value: string; count?: number; prevalence?: number } }> = ({ entry }) => (
  <div className="p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700">
    <div className="text-sm font-mono text-gray-900 dark:text-gray-100 truncate">{entry.value}</div>
    {entry.count !== undefined && (
      <div className="text-xs text-gray-500 dark:text-gray-400">
        {entry.count} uses{entry.prevalence !== undefined ? ` (${entry.prevalence}%)` : ''}
      </div>
    )}
  </div>
);

const InlineChips: React.FC<{ entries: Array<{ value: string }>; max?: number }> = ({ entries, max = 16 }) => (
  <div className="flex flex-wrap gap-1.5">
    {entries.slice(0, max).map((e, i) => (
      <span key={i} className="text-xs font-mono px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
        {e.value}
      </span>
    ))}
    {entries.length > max && (
      <span className="text-xs text-gray-500 dark:text-gray-400 self-center">+{entries.length - max} more</span>
    )}
  </div>
);

const TokenExplorer: React.FC<TokenExplorerProps> = ({ analysisData }) => {
  if (!analysisData) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
          <PaletteIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">No Analysis Results</h2>
        <p className="text-gray-600 dark:text-gray-400">Analyze a website first to explore its design tokens.</p>
      </div>
    );
  }

  const tokens = analysisData.data?.tokens;
  const colors = normalizeField(tokens?.colors);
  const fontFamilies = normalizeField(tokens?.fontFamilies);
  const fontSizes = filterResolved(normalizeField(tokens?.fontSizes));
  const fontWeights = filterResolved(normalizeField(tokens?.fontWeights));
  const lineHeights = filterResolved(normalizeField(tokens?.lineHeights));
  const letterSpacings = filterResolved(normalizeField(tokens?.letterSpacings));
  const spacing = normalizeField(tokens?.spacing);
  const radii = normalizeField(tokens?.radii);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Token Explorer</h2>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Extracted from <span className="font-medium">{analysisData.meta?.source || 'Unknown'}</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Colors */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4">
          <div className="flex items-center gap-2 mb-4">
            <PaletteIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            <h3 className="font-medium">Colors</h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">({colors.length})</span>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {colors.slice(0, 10).map((color, index) => (
              <div key={index} className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700">
                <div
                  className="w-6 h-6 rounded border border-gray-200 dark:border-gray-600 flex-shrink-0"
                  style={{ backgroundColor: color.value }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-mono text-gray-900 dark:text-gray-100 truncate">{color.value}</div>
                  {color.count !== undefined && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {color.count} uses{color.prevalence !== undefined ? ` (${color.prevalence}%)` : ''}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Typography — expanded to all five buckets */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4">
          <div className="flex items-center gap-2 mb-4">
            <TypeIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            <h3 className="font-medium">Typography</h3>
          </div>

          <div className="space-y-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
                Font Families ({fontFamilies.length})
              </div>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {fontFamilies.slice(0, 8).map((font, index) => (
                  <FrequencyRow key={index} entry={font} />
                ))}
                {fontFamilies.length === 0 && (
                  <div className="text-xs text-gray-400 dark:text-gray-500 italic">None detected</div>
                )}
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
                Font Sizes ({fontSizes.length})
              </div>
              {fontSizes.length > 0 ? <InlineChips entries={fontSizes} /> : <div className="text-xs text-gray-400 dark:text-gray-500 italic">None detected</div>}
            </div>

            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
                Font Weights ({fontWeights.length})
              </div>
              {fontWeights.length > 0 ? <InlineChips entries={fontWeights} /> : <div className="text-xs text-gray-400 dark:text-gray-500 italic">None detected</div>}
            </div>

            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
                Line Heights ({lineHeights.length})
              </div>
              {lineHeights.length > 0 ? <InlineChips entries={lineHeights} max={10} /> : <div className="text-xs text-gray-400 dark:text-gray-500 italic">None detected</div>}
            </div>

            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
                Letter Spacings ({letterSpacings.length})
              </div>
              {letterSpacings.length > 0 ? <InlineChips entries={letterSpacings} max={10} /> : <div className="text-xs text-gray-400 dark:text-gray-500 italic">None detected</div>}
            </div>
          </div>
        </div>

        {/* Spacing */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4">
          <div className="flex items-center gap-2 mb-4">
            <RulerIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            <h3 className="font-medium">Spacing</h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">({spacing.length})</span>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {spacing.slice(0, 10).map((space, index) => (
              <div key={index} className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700">
                <div
                  className="bg-blue-200 dark:bg-blue-800 flex-shrink-0"
                  style={{ width: Math.min(parseFloat(space.value) || 4, 40), height: '1rem' }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-mono text-gray-900 dark:text-gray-100 truncate">{space.value}</div>
                  {space.count !== undefined && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {space.count} uses{space.prevalence !== undefined ? ` (${space.prevalence}%)` : ''}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Radii — new card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4">
          <div className="flex items-center gap-2 mb-4">
            <ScalingIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            <h3 className="font-medium">Radii</h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">({radii.length})</span>
          </div>
          {radii.length > 0 ? <InlineChips entries={radii} /> : <div className="text-xs text-gray-400 dark:text-gray-500 italic">None detected</div>}
        </div>

        {/* Custom Properties */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4 md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <CircleIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            <h3 className="font-medium">Custom Properties</h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              ({Object.keys(analysisData.data?.tokens?.customProperties || {}).length})
            </span>
          </div>
          <div className="grid md:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
            {Object.entries(analysisData.data?.tokens?.customProperties || {}).slice(0, 20).map(([key, value], index) => (
              <div key={index} className="p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="text-sm font-mono text-gray-900 dark:text-gray-100 truncate">{key}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{String(value)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenExplorer;
