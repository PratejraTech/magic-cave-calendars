import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ProductRenderer, LoadingSkeleton, ErrorBoundary } from '../../features/product-view';
import { fetchProductContent, openProductContent, trackAnalytics, type ProductContentResponse } from '../../lib/api';
import { useTheme } from '../../themes/ThemeProvider';

/**
 * ProductViewRoute - Generalized route for viewing any product type
 *
 * This route replaces the calendar-specific ChildCalendarRoute and uses
 * the new ProductRenderer factory to display different product types.
 */
export function ProductViewRoute() {
  const { shareUuid } = useParams<{ shareUuid: string }>();
  const { setTheme } = useTheme();
  const [productData, setProductData] = useState<ProductContentResponse | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load product data on mount
  useEffect(() => {
    const loadProductData = async () => {
      if (!shareUuid) return;

      try {
        setIsLoading(true);
        setError(null);

        const productResponse = await fetchProductContent(shareUuid);

        setProductData(productResponse);

        // Set theme from product data
        if (productResponse.product.theme) {
          setTheme(productResponse.product.theme);
        }

        // Track product view analytics
        trackAnalytics(shareUuid, 'product_open');
      } catch {
        // Error handled silently - could show user notification
        setError('Failed to load product. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadProductData();
  }, [shareUuid, setTheme]);

  const handleContentOpen = async (contentId: string) => {
    if (!shareUuid || !productData) return;

    // Update local state optimistically
    setProductData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        content: prev.content.map(content =>
          content.id === contentId
            ? { ...content, is_unlocked: true, is_completed: true, completed_at: new Date().toISOString() }
            : content
        )
      };
    });

    // Track content open analytics
    trackAnalytics(shareUuid, 'content_open', { content_id: contentId });

    // Mark content as opened in backend
    try {
      await openProductContent(shareUuid, contentId);
    } catch {
      // Error handled silently - could show user notification
      // Continue with UI update even if backend call fails
    }
  };

  if (isLoading) {
    return (
      <LoadingSkeleton
        type={productData?.product.product_type_id === 'calendar' ? 'calendar' :
              productData?.product.product_type_id === 'storybook' ? 'storybook' :
              productData?.product.product_type_id === 'interactive_game' ? 'game' : 'calendar'}
        theme={productData?.product.theme}
      />
    );
  }

  if (error || !productData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Oops! Something went wrong
          </h1>
          <p className="text-gray-600 mb-4">
            {error || 'Unable to load the product.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary
      productType={productData.product.product_type_id as 'calendar' | 'storybook' | 'interactive_game'}
      theme={productData.product.theme}
    >
      <ProductRenderer
        product={{
          ...productData.product,
          product_type_id: productData.product.product_type_id as 'calendar' | 'storybook' | 'interactive_game'
        }}
        content={productData.content}
        onContentOpen={handleContentOpen}
        theme={productData.product.theme}
      />
    </ErrorBoundary>
  );
}