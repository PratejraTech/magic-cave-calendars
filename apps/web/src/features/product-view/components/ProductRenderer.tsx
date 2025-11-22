import React from 'react';
import { ProductRendererProps } from '../types/product';
import { CalendarRenderer } from './CalendarRenderer';
import { StorybookRenderer } from './StorybookRenderer';
import { GameRenderer } from './GameRenderer';

// Registry of product renderers by product type
const PRODUCT_RENDERERS = {
  calendar: CalendarRenderer,
  storybook: StorybookRenderer,
  interactive_game: GameRenderer,
} as const;

// Default renderer for unsupported product types
const DefaultRenderer: React.FC<ProductRendererProps> = ({ product }) => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">
        Product Type Not Supported
      </h1>
      <p className="text-gray-600">
        The product type "{product.product_type_id}" is not yet supported.
      </p>
      <p className="text-sm text-gray-500 mt-2">
        Product ID: {product.id}
      </p>
    </div>
  </div>
);

/**
 * ProductRenderer - Factory component that renders different product types
 *
 * This component uses a factory pattern to delegate rendering to specialized
 * components based on the product type. Each product type has its own renderer
 * that handles the specific interaction patterns and UI for that product type.
 */
export const ProductRenderer: React.FC<ProductRendererProps> = (props) => {
  const { product } = props;
  const Renderer = PRODUCT_RENDERERS[product.product_type_id] || DefaultRenderer;

  return <Renderer {...props} />;
};

export default ProductRenderer;