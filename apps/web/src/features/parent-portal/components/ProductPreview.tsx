import { useState, useEffect } from 'react';
import { Eye, RefreshCw, AlertCircle } from 'lucide-react';
import { ProductType, Template } from '../../../lib/api';
import { isProductPreviewEnabled } from '../../../lib/featureFlags';

// Preview content item types
interface CalendarGridItem {
  type: 'calendar_grid';
  title: string;
  description: string;
  items: Array<{
    day: number;
    hasContent: boolean;
    hasPhoto: boolean;
  }>;
}

interface SampleDayItem {
  type: 'sample_day';
  title: string;
  content: string;
  hasPhoto: boolean;
}

interface StorybookCoverItem {
  type: 'storybook_cover';
  title: string;
  author: string;
  illustration: string;
}

interface ChapterListItem {
  type: 'chapter_list';
  title: string;
  chapters: Array<{
    number: number;
    title: string;
    preview: string;
  }>;
}

interface GameLevelsItem {
  type: 'game_levels';
  title: string;
  description: string;
  levels: Array<{
    number: number;
    name: string;
    difficulty: string;
    completed: boolean;
  }>;
}

interface GameFeaturesItem {
  type: 'game_features';
  title: string;
  features: string[];
}

interface DefaultPreviewItem {
  type: string;
  title?: string;
  content?: string;
  [key: string]: unknown;
}

type PreviewContentItem =
  | CalendarGridItem
  | SampleDayItem
  | StorybookCoverItem
  | ChapterListItem
  | GameLevelsItem
  | GameFeaturesItem
  | DefaultPreviewItem;

interface ProductPreviewProps {
  selectedProductType: ProductType | null;
  selectedTemplate: Template | null;
  customData: Record<string, unknown>;
  onPreviewUpdate?: (previewData: PreviewData) => void;
}

interface PreviewData {
  title: string;
  description: string;
  thumbnail: string;
  content: PreviewContentItem[];
  theme: string;
  estimatedCompletion: string;
}

export function ProductPreview({
  selectedProductType,
  selectedTemplate,
  customData,
  onPreviewUpdate
}: ProductPreviewProps) {
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if preview is enabled
  const previewEnabled = isProductPreviewEnabled();

  useEffect(() => {
    if (!previewEnabled || !selectedProductType || !selectedTemplate) {
      setPreviewData(null);
      return;
    }

    generatePreview();
  }, [selectedProductType, selectedTemplate, customData, previewEnabled]);

  const generatePreview = async () => {
    setLoading(true);
    setError(null);

    try {
      // Simulate AI preview generation (in real implementation, this would call an API)
      await new Promise(resolve => setTimeout(resolve, 1500));

      const mockPreview: PreviewData = generateMockPreview();
      setPreviewData(mockPreview);

      if (onPreviewUpdate) {
        onPreviewUpdate(mockPreview);
      }
    } catch (err) {
      // TODO: Implement proper logging service
      setError('Failed to generate preview. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateMockPreview = (): PreviewData => {
    const basePreview: PreviewData = {
      title: (customData.title as string) || `${selectedProductType!.name} Preview`,
      description: `A preview of your ${selectedProductType!.name.toLowerCase()}`,
      thumbnail: getProductTypeThumbnail(selectedProductType!.id),
      content: [],
      theme: (customData.theme as string) || 'snow',
      estimatedCompletion: '2-3 minutes',
    };

    // Generate product-specific content preview
    switch (selectedProductType!.id) {
      case 'calendar':
        basePreview.content = generateCalendarPreview();
        break;
      case 'storybook':
        basePreview.content = generateStorybookPreview();
        break;
      case 'interactive_game':
        basePreview.content = generateGamePreview();
        break;
      default:
        basePreview.content = [{ type: 'text', content: 'Preview not available for this product type.' }];
    }

    return basePreview;
  };

  const generateCalendarPreview = (): PreviewContentItem[] => {
    const days = (customData.days as number) || 24;
    return [
      {
        type: 'calendar_grid',
        title: 'Advent Calendar Layout',
        description: `${days} magical days arranged in a beautiful grid`,
        items: Array.from({ length: Math.min(days as number, 6) }, (_, i) => ({
          day: i + 1,
          hasContent: Math.random() > 0.3,
          hasPhoto: Math.random() > 0.5,
        }))
      },
      {
        type: 'sample_day',
        title: 'Sample Day Content',
        content: (customData.sampleMessage as string) || 'A magical message for this special day! 🎄',
        hasPhoto: true
      }
    ];
  };

  const generateStorybookPreview = (): PreviewContentItem[] => {
    const chapters = (customData.chapters as number) || 5;
    return [
      {
        type: 'storybook_cover',
        title: (customData.title as string) || 'My Storybook',
        author: (customData.author as string) || 'A Magical Tale',
        illustration: 'storybook-cover.jpg'
      },
      {
        type: 'chapter_list',
        title: 'Story Chapters',
        chapters: Array.from({ length: chapters }, (_, i) => ({
          number: i + 1,
          title: `Chapter ${i + 1}`,
          preview: `Chapter ${i + 1} content preview...`
        }))
      }
    ];
  };

  const generateGamePreview = (): PreviewContentItem[] => {
    const levels = (customData.levels as number) || 10;
    return [
      {
        type: 'game_levels',
        title: 'Game Structure',
        description: `${levels} exciting levels to complete`,
        levels: Array.from({ length: Math.min(levels, 5) }, (_, i) => ({
          number: i + 1,
          name: `Level ${i + 1}`,
          difficulty: ['Easy', 'Medium', 'Hard'][Math.floor(Math.random() * 3)],
          completed: Math.random() > 0.7
        }))
      },
      {
        type: 'game_features',
        title: 'Game Features',
        features: ['Interactive challenges', 'Collectible rewards', 'Progress tracking', 'Achievement system']
      }
    ];
  };

  const getProductTypeThumbnail = (productTypeId: string): string => {
    switch (productTypeId) {
      case 'calendar':
        return '🎄';
      case 'storybook':
        return '📚';
      case 'interactive_game':
        return '🎮';
      default:
        return '🎁';
    }
  };

  if (!previewEnabled) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-center">
          <Eye className="w-8 h-8 text-gray-400 mr-3" />
          <div>
            <h3 className="text-lg font-medium text-gray-900">Product Preview</h3>
            <p className="text-sm text-gray-600">Preview functionality is not yet available.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedProductType || !selectedTemplate) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-center">
          <Eye className="w-8 h-8 text-gray-400 mr-3" />
          <div>
            <h3 className="text-lg font-medium text-gray-900">Product Preview</h3>
            <p className="text-sm text-gray-600">Select a product type and template to see a preview.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Eye className="w-5 h-5 text-gray-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Product Preview</h3>
        </div>
        <button
          onClick={generatePreview}
          disabled={loading}
          className="flex items-center px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-1" />
              Refresh
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      {loading && !previewData && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Generating preview...</p>
          </div>
        </div>
      )}

      {previewData && (
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <div className="text-6xl mb-4">{previewData.thumbnail}</div>
            <h4 className="text-xl font-semibold text-gray-900 mb-2">{previewData.title}</h4>
            <p className="text-gray-600 mb-4">{previewData.description}</p>
            <div className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              Theme: {previewData.theme} • Est. completion: {previewData.estimatedCompletion}
            </div>
          </div>

          {/* Content Preview */}
          <div className="space-y-4">
            {previewData.content.map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                {renderPreviewItem(item)}
              </div>
            ))}
          </div>

          {/* Preview Note */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> This is a preview based on your current selections.
              The final product may vary slightly based on AI generation and customization options.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function renderPreviewItem(item: PreviewContentItem) {
  switch (item.type) {
    case 'calendar_grid': {
      const calendarItem = item as CalendarGridItem;
      return (
        <div>
          <h5 className="font-medium text-gray-900 mb-2">{calendarItem.title}</h5>
          <p className="text-sm text-gray-600 mb-3">{calendarItem.description}</p>
          <div className="grid grid-cols-3 gap-2">
            {calendarItem.items.map((dayItem, idx) => (
              <div
                key={idx}
                className={`aspect-square rounded border-2 flex items-center justify-center text-xs font-medium ${
                  dayItem.hasContent
                    ? 'border-green-300 bg-green-50 text-green-700'
                    : 'border-gray-200 bg-gray-50 text-gray-400'
                }`}
              >
                {dayItem.day}
                {dayItem.hasPhoto && <span className="ml-1">📷</span>}
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'sample_day': {
      const sampleItem = item as SampleDayItem;
      return (
        <div>
          <h5 className="font-medium text-gray-900 mb-2">{sampleItem.title}</h5>
          <div className="bg-gray-50 rounded p-3">
            <p className="text-sm text-gray-700 mb-2">{sampleItem.content}</p>
            {sampleItem.hasPhoto && (
              <div className="w-full h-16 bg-gray-200 rounded flex items-center justify-center">
                <span className="text-xs text-gray-500">📷 Photo</span>
              </div>
            )}
          </div>
        </div>
      );
    }

    case 'storybook_cover': {
      const coverItem = item as StorybookCoverItem;
      return (
        <div className="text-center">
          <div className="w-24 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
            <span className="text-2xl">📖</span>
          </div>
          <h5 className="font-medium text-gray-900">{coverItem.title}</h5>
          <p className="text-sm text-gray-600">by {coverItem.author}</p>
        </div>
      );
    }

    case 'chapter_list': {
      const chapterItem = item as ChapterListItem;
      return (
        <div>
          <h5 className="font-medium text-gray-900 mb-3">{chapterItem.title}</h5>
          <div className="space-y-2">
            {chapterItem.chapters.map((chapter) => (
              <div key={chapter.number} className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-medium">
                  {chapter.number}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{chapter.title}</p>
                  <p className="text-xs text-gray-600">{chapter.preview}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'game_levels': {
      const levelsItem = item as GameLevelsItem;
      return (
        <div>
          <h5 className="font-medium text-gray-900 mb-2">{levelsItem.title}</h5>
          <p className="text-sm text-gray-600 mb-3">{levelsItem.description}</p>
          <div className="space-y-2">
            {levelsItem.levels.map((level) => (
              <div key={level.number} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                    level.completed ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-700'
                  }`}>
                    {level.completed ? '✓' : level.number}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{level.name}</p>
                    <p className="text-xs text-gray-600">{level.difficulty}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'game_features': {
      const featuresItem = item as GameFeaturesItem;
      return (
        <div>
          <h5 className="font-medium text-gray-900 mb-3">{featuresItem.title}</h5>
          <div className="grid grid-cols-2 gap-2">
            {featuresItem.features.map((feature, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    default: {
      const defaultItem = item as DefaultPreviewItem;
      return (
        <div>
          <h5 className="font-medium text-gray-900 mb-2">{defaultItem.title || 'Preview Item'}</h5>
          <p className="text-sm text-gray-600">{defaultItem.content || 'Content preview not available'}</p>
        </div>
      );
    }
  }
}