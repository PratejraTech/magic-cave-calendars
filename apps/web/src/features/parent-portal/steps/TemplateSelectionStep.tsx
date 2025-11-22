import { useState, useEffect } from 'react';
import { Palette, Check, Sparkles, AlertCircle } from 'lucide-react';
import { getTemplatesByProductType, Template, ProductType } from '../../../lib/api';

interface TemplateSelectionStepProps {
  selectedProductType: ProductType | null;
  selectedTemplate: Template | null;
  onTemplateSelect: (template: Template) => void;
}

const THEME_PREVIEWS = {
  snow: '❄️',
  warm: '✨',
  candy: '🍬',
  forest: '🌲',
  starlight: '⭐',
};

export function TemplateSelectionStep({
  selectedProductType,
  selectedTemplate,
  onTemplateSelect
}: TemplateSelectionStepProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTemplates = async () => {
      if (!selectedProductType) {
        setTemplates([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const templateList = await getTemplatesByProductType(selectedProductType.id);
        setTemplates(templateList);
      } catch (err) {
        // Error handled silently - could show user notification
        setError('Failed to load templates. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadTemplates();
  }, [selectedProductType]);

  if (!selectedProductType) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose a Template</h2>
          <p className="text-gray-600">Please select a product type first.</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-3" />
            <p className="text-yellow-800">Select a product type to see available templates.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose a Template</h2>
          <p className="text-gray-600">Loading templates for {selectedProductType.name}...</p>
        </div>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose a Template</h2>
          <p className="text-gray-600">Select a template to customize your {selectedProductType.name.toLowerCase()}.</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-red-600">⚠️</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose a Template</h2>
        <p className="text-gray-600">
          Select a template to customize your {selectedProductType.name.toLowerCase()}.
          Templates provide pre-designed layouts and styling options.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Sparkles className="w-5 h-5 text-blue-600" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-800">
              <strong>Template features:</strong> Each template includes custom data forms, compatible themes, and product-specific layouts.
            </p>
          </div>
        </div>
      </div>

      {templates.length === 0 ? (
        <div className="bg-white rounded-lg border p-6">
          <div className="text-center py-12">
            <Palette className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No templates available</h3>
            <p className="text-gray-600 mb-4">
              There are currently no templates available for {selectedProductType.name.toLowerCase()}.
            </p>
            <p className="text-sm text-gray-500">
              Templates will be added soon. You can continue with the default configuration.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {templates.map((template) => {
            const isSelected = selectedTemplate?.id === template.id;

            return (
              <div
                key={template.id}
                onClick={() => onTemplateSelect(template)}
                className={`relative cursor-pointer rounded-lg border-2 p-6 transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 shadow-lg'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}
              >
                {/* Selection Indicator */}
                {isSelected && (
                  <div className="absolute top-3 right-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  </div>
                )}

                {/* Template Preview */}
                <div className="w-full h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-2xl">🎨</span>
                </div>

                {/* Template Info */}
                <div>
                  <h3 className={`font-semibold text-lg mb-2 ${
                    isSelected ? 'text-blue-900' : 'text-gray-900'
                  }`}>
                    {template.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {template.description}
                  </p>

                  {/* Compatible Themes */}
                  {template.compatible_themes && template.compatible_themes.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Compatible Themes:</p>
                      <div className="flex flex-wrap gap-1">
                        {template.compatible_themes.map((theme) => (
                          <span
                            key={theme}
                            className={`px-2 py-1 text-xs rounded-full flex items-center ${
                              isSelected
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            <span className="mr-1">
                              {THEME_PREVIEWS[theme as keyof typeof THEME_PREVIEWS] || '🎨'}
                            </span>
                            {theme}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Product Type Compatibility */}
                  <div className="flex items-center text-sm">
                    <Check className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-gray-600">
                      Compatible with {selectedProductType.name}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Selected Template Summary */}
      {selectedTemplate && (
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Selected Template</h3>
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-lg">🎨</span>
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">
                {selectedTemplate.name}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                {selectedTemplate.description}
              </p>
              {selectedTemplate.compatible_themes && (
                <div className="flex flex-wrap gap-1">
                  {selectedTemplate.compatible_themes.map((theme) => (
                    <span
                      key={theme}
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full"
                    >
                      {THEME_PREVIEWS[theme as keyof typeof THEME_PREVIEWS] || '🎨'} {theme}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}