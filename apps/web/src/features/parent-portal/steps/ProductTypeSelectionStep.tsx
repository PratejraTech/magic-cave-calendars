import { useState, useEffect } from 'react';
import { Calendar, BookOpen, Gamepad2, Check, Sparkles } from 'lucide-react';
import { getProductTypes, ProductType } from '../../../lib/api';

interface ProductTypeSelectionStepProps {
  selectedProductType: ProductType | null;
  onProductTypeSelect: (productType: ProductType) => void;
}

const PRODUCT_TYPE_ICONS = {
  calendar: Calendar,
  storybook: BookOpen,
  interactive_game: Gamepad2,
};

const PRODUCT_TYPE_PREVIEWS = {
  calendar: '🎄',
  storybook: '📚',
  interactive_game: '🎮',
};

export function ProductTypeSelectionStep({
  selectedProductType,
  onProductTypeSelect
}: ProductTypeSelectionStepProps) {
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProductTypes = async () => {
      try {
        setLoading(true);
        const types = await getProductTypes();
        setProductTypes(types);
      } catch (err) {
        console.error('Failed to load product types:', err);
        setError('Failed to load product types. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadProductTypes();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Product</h2>
          <p className="text-gray-600">Loading available products...</p>
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Product</h2>
          <p className="text-gray-600">Select the type of magical experience you want to create.</p>
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Product</h2>
        <p className="text-gray-600">Select the type of magical experience you want to create for your child.</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Sparkles className="w-5 h-5 text-blue-600" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-800">
              <strong>What's new:</strong> You can now create interactive storybooks and games in addition to advent calendars!
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {productTypes.map((productType) => {
          const Icon = PRODUCT_TYPE_ICONS[productType.id as keyof typeof PRODUCT_TYPE_ICONS] || Calendar;
          const preview = PRODUCT_TYPE_PREVIEWS[productType.id as keyof typeof PRODUCT_TYPE_PREVIEWS] || '🎁';
          const isSelected = selectedProductType?.id === productType.id;

          return (
            <div
              key={productType.id}
              onClick={() => onProductTypeSelect(productType)}
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

              {/* Product Preview */}
              <div className="w-full h-20 flex items-center justify-center mb-4">
                <span className="text-4xl">{preview}</span>
              </div>

              {/* Product Info */}
              <div className="text-center">
                <div className="flex items-center justify-center mb-3">
                  <Icon className={`w-5 h-5 mr-2 ${
                    isSelected ? 'text-blue-600' : 'text-gray-600'
                  }`} />
                  <h3 className={`font-semibold text-lg ${
                    isSelected ? 'text-blue-900' : 'text-gray-900'
                  }`}>
                    {productType.name}
                  </h3>
                </div>

                <p className="text-gray-600 text-sm mb-4">
                  {productType.description}
                </p>

                {/* Features */}
                <div className="flex flex-wrap justify-center gap-1 mb-4">
                  {productType.supported_features.slice(0, 3).map((feature) => (
                    <span
                      key={feature}
                      className={`px-2 py-1 text-xs rounded-full ${
                        isSelected
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {feature.replace('_', ' ')}
                    </span>
                  ))}
                  {productType.supported_features.length > 3 && (
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      isSelected
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      +{productType.supported_features.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Product Summary */}
      {selectedProductType && (
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Selected Product</h3>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 flex items-center justify-center">
              <span className="text-2xl">
                {PRODUCT_TYPE_PREVIEWS[selectedProductType.id as keyof typeof PRODUCT_TYPE_PREVIEWS] || '🎁'}
              </span>
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {selectedProductType.name}
              </p>
              <p className="text-sm text-gray-600">
                {selectedProductType.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}