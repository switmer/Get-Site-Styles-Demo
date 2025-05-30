import React from 'react';
import { PaletteIcon, TypeIcon, RulerIcon, CircleIcon } from 'lucide-react';

interface TokenExplorerProps {
  analysisData: {
    meta?: {
      source?: string;
    };
    data?: {
      tokens?: {
        colors?: {
          frequency?: Array<{ value: string; count: number; prevalence: number }>;
        };
        fontFamilies?: {
          frequency?: Array<{ value: string; count: number; prevalence: number }>;
        };
        spacing?: {
          frequency?: Array<{ value: string; count: number; prevalence: number }>;
        };
        customProperties?: Record<string, unknown>;
      };
    };
  } | null;
}

const TokenExplorer: React.FC<TokenExplorerProps> = ({ analysisData }) => {
  if (!analysisData) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
          <PaletteIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
          No Analysis Results
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Analyze a website first to explore its design tokens.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Token Explorer</h2>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Extracted from{' '}
          <span className="font-medium">{analysisData.meta?.source || 'Unknown'}</span>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Colors */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4">
          <div className="flex items-center gap-2 mb-4">
            <PaletteIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            <h3 className="font-medium">Colors</h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              ({analysisData.data?.tokens?.colors?.frequency?.length || 0})
            </span>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {analysisData.data?.tokens?.colors?.frequency?.slice(0, 10).map((color, index: number) => (
              <div key={index} className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700">
                <div 
                  className="w-6 h-6 rounded border border-gray-200 dark:border-gray-600 flex-shrink-0"
                  style={{ backgroundColor: color.value }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-mono text-gray-900 dark:text-gray-100 truncate">
                    {color.value}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {color.count} uses ({color.prevalence}%)
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Typography */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4">
          <div className="flex items-center gap-2 mb-4">
            <TypeIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            <h3 className="font-medium">Typography</h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              ({analysisData.data?.tokens?.fontFamilies?.frequency?.length || 0})
            </span>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {analysisData.data?.tokens?.fontFamilies?.frequency?.slice(0, 8).map((font, index: number) => (
              <div key={index} className="p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="text-sm font-mono text-gray-900 dark:text-gray-100 truncate">
                  {font.value}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {font.count} uses ({font.prevalence}%)
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Spacing */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4">
          <div className="flex items-center gap-2 mb-4">
            <RulerIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            <h3 className="font-medium">Spacing</h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              ({analysisData.data?.tokens?.spacing?.frequency?.length || 0})
            </span>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {analysisData.data?.tokens?.spacing?.frequency?.slice(0, 10).map((space, index: number) => (
              <div key={index} className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700">
                <div 
                  className="bg-blue-200 dark:bg-blue-800 flex-shrink-0"
                  style={{ width: Math.min(parseFloat(space.value) || 4, 40), height: '1rem' }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-mono text-gray-900 dark:text-gray-100 truncate">
                    {space.value}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {space.count} uses ({space.prevalence}%)
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Properties */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4">
          <div className="flex items-center gap-2 mb-4">
            <CircleIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            <h3 className="font-medium">Custom Properties</h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              ({Object.keys(analysisData.data?.tokens?.customProperties || {}).length})
            </span>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {Object.entries(analysisData.data?.tokens?.customProperties || {}).slice(0, 10).map(([key, value], index: number) => (
              <div key={index} className="p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="text-sm font-mono text-gray-900 dark:text-gray-100 truncate">
                  {key}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {String(value)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenExplorer; 