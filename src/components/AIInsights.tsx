import React from 'react';
import { SparklesIcon, AlertTriangleIcon, CheckCircleIcon, XCircleIcon, InfoIcon, LightbulbIcon } from 'lucide-react';

interface AIInsightsProps {
  analysisData: any;
}

const AIInsights: React.FC<AIInsightsProps> = ({ analysisData }) => {
  if (!analysisData) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
          <SparklesIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
          No Analysis Results
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Analyze a website first to get AI-powered insights about its design system.
        </p>
      </div>
    );
  }

  // Generate insights based on actual analysis data
  const generateInsights = (data: any) => {
    const insights = [];
    
    // Color analysis
    const colorCount = data.data?.tokens?.colors?.frequency?.length || 0;
    if (colorCount > 50) {
      insights.push({
        type: 'warning',
        title: 'Color Palette Complexity',
        description: `This design system uses ${colorCount} unique colors, which may indicate inconsistency in the color palette.`,
        recommendation: 'Consider consolidating similar colors into a more systematic color scale with fewer, but more intentional color choices.',
        icon: <AlertTriangleIcon className="w-5 h-5 text-amber-500" />
      });
    } else if (colorCount > 20) {
      insights.push({
        type: 'info',
        title: 'Moderate Color Palette',
        description: `The design system uses ${colorCount} unique colors, which is reasonable but could benefit from organization.`,
        recommendation: 'Group colors into semantic categories (primary, secondary, accent, neutral) for better maintainability.',
        icon: <InfoIcon className="w-5 h-5 text-blue-500" />
      });
    } else {
      insights.push({
        type: 'success',
        title: 'Well-Controlled Color Palette',
        description: `The design system uses ${colorCount} unique colors, indicating good color discipline.`,
        recommendation: 'Maintain this focused approach to color for consistency across the design system.',
        icon: <CheckCircleIcon className="w-5 h-5 text-green-500" />
      });
    }

    // Custom properties analysis
    const customPropsCount = Object.keys(data.data?.tokens?.customProperties || {}).length;
    if (customPropsCount > 100) {
      insights.push({
        type: 'success',
        title: 'Rich CSS Custom Properties',
        description: `This site uses ${customPropsCount} CSS custom properties, indicating a mature design system approach.`,
        recommendation: 'Leverage these existing properties when building new components to maintain consistency.',
        icon: <CheckCircleIcon className="w-5 h-5 text-green-500" />
      });
    } else if (customPropsCount > 20) {
      insights.push({
        type: 'info',
        title: 'Moderate Design Token Usage',
        description: `The site uses ${customPropsCount} CSS custom properties, showing some design system adoption.`,
        recommendation: 'Consider expanding the use of CSS custom properties for better theme-ability and maintenance.',
        icon: <InfoIcon className="w-5 h-5 text-blue-500" />
      });
    } else {
      insights.push({
        type: 'suggestion',
        title: 'Design Token Opportunity',
        description: `Only ${customPropsCount} CSS custom properties detected. There's opportunity to systematize the design.`,
        recommendation: 'Implement CSS custom properties for colors, spacing, and typography to create a more maintainable design system.',
        icon: <LightbulbIcon className="w-5 h-5 text-purple-500" />
      });
    }

    // Typography analysis
    const fontFamilyCount = data.data?.tokens?.fontFamilies?.frequency?.length || 0;
    if (fontFamilyCount > 10) {
      insights.push({
        type: 'warning',
        title: 'Font Family Inconsistency',
        description: `${fontFamilyCount} different font families detected, which may impact loading performance and visual consistency.`,
        recommendation: 'Consolidate to 2-3 core font families: one for body text, one for headings, and optionally one for monospace.',
        icon: <AlertTriangleIcon className="w-5 h-5 text-amber-500" />
      });
    } else if (fontFamilyCount <= 3) {
      insights.push({
        type: 'success',
        title: 'Focused Typography System',
        description: `Using ${fontFamilyCount} font families shows good typographic discipline.`,
        recommendation: 'Continue to maintain this focused approach to typography for better brand consistency.',
        icon: <CheckCircleIcon className="w-5 h-5 text-green-500" />
      });
    }

    // Spacing analysis
    const spacingCount = data.data?.tokens?.spacing?.frequency?.length || 0;
    if (spacingCount > 30) {
      insights.push({
        type: 'warning',
        title: 'Spacing Inconsistency',
        description: `${spacingCount} unique spacing values detected, indicating potential lack of a systematic spacing scale.`,
        recommendation: 'Implement a mathematical spacing scale (e.g., 4px, 8px, 16px, 32px) for more consistent layouts.',
        icon: <AlertTriangleIcon className="w-5 h-5 text-amber-500" />
      });
    } else {
      insights.push({
        type: 'success',
        title: 'Consistent Spacing System',
        description: `${spacingCount} spacing values suggests good spacing discipline.`,
        recommendation: 'Document these spacing values as part of your design system tokens.',
        icon: <CheckCircleIcon className="w-5 h-5 text-green-500" />
      });
    }

    return insights;
  };

  const insights = generateInsights(analysisData);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <SparklesIcon className="w-5 h-5 text-blue-600" />
          AI Design Insights
        </h2>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {insights.length} insights found
        </div>
      </div>
      
      <div className="grid gap-4">
        {insights.map((insight, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 shadow-sm p-4">
            <div className="flex gap-3">
              <div className="mt-1">{insight.icon}</div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                  {insight.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                  {insight.description}
                </p>
                <div className="bg-gray-50 dark:bg-gray-900 border-l-4 border-blue-500 p-3 rounded">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    RECOMMENDATION
                  </div>
                  <div className="text-sm">{insight.recommendation}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 p-4 rounded-md">
        <h3 className="font-medium mb-2 flex items-center gap-2">
          <SparklesIcon className="w-4 h-4" />
          Design System Health Score
        </h3>
        <div className="text-sm mb-3">
          Based on the analysis of your design tokens, here's an overall assessment:
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-white dark:bg-gray-800 rounded p-3">
            <div className="font-medium text-green-600 dark:text-green-400">Color System</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {analysisData.data?.tokens?.colors?.frequency?.length || 0} unique colors
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded p-3">
            <div className="font-medium text-blue-600 dark:text-blue-400">Typography</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {analysisData.data?.tokens?.fontFamilies?.frequency?.length || 0} font families
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded p-3">
            <div className="font-medium text-purple-600 dark:text-purple-400">Spacing</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {analysisData.data?.tokens?.spacing?.frequency?.length || 0} spacing values
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIInsights; 