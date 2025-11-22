/**
 * Feature flags for controlling generalized product functionality
 *
 * These flags allow for gradual rollout and backward compatibility
 * during the transition from calendar-specific to generalized products.
 */

export interface FeatureFlags {
  // Core generalized products feature
  enableGeneralizedProducts: boolean;

  // Individual product type enablement
  enableProductTypeCalendar: boolean;
  enableProductTypeStorybook: boolean;
  enableProductTypeInteractiveGame: boolean;

  // Template system features
  enableTemplateSelection: boolean;
  enableCustomDataForms: boolean;

  // Advanced features
  enableProductPreview: boolean;
  enableBulkOperations: boolean;
}

// Default feature flags (conservative approach)
export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  enableGeneralizedProducts: false,
  enableProductTypeCalendar: true, // Keep calendar enabled for backward compatibility
  enableProductTypeStorybook: false,
  enableProductTypeInteractiveGame: false,
  enableTemplateSelection: false,
  enableCustomDataForms: false,
  enableProductPreview: false,
  enableBulkOperations: false,
};

// Environment-based overrides (can be controlled via environment variables)
const getEnvFlag = (key: string, defaultValue: boolean): boolean => {
  const envValue = process.env[key];
  if (envValue === undefined) return defaultValue;
  return envValue.toLowerCase() === 'true';
};

// Current feature flags (with environment overrides)
export const FEATURE_FLAGS: FeatureFlags = {
  enableGeneralizedProducts: getEnvFlag('VITE_ENABLE_GENERALIZED_PRODUCTS', DEFAULT_FEATURE_FLAGS.enableGeneralizedProducts),
  enableProductTypeCalendar: getEnvFlag('VITE_ENABLE_PRODUCT_TYPE_CALENDAR', DEFAULT_FEATURE_FLAGS.enableProductTypeCalendar),
  enableProductTypeStorybook: getEnvFlag('VITE_ENABLE_PRODUCT_TYPE_STORYBOOK', DEFAULT_FEATURE_FLAGS.enableProductTypeStorybook),
  enableProductTypeInteractiveGame: getEnvFlag('VITE_ENABLE_PRODUCT_TYPE_INTERACTIVE_GAME', DEFAULT_FEATURE_FLAGS.enableProductTypeInteractiveGame),
  enableTemplateSelection: getEnvFlag('VITE_ENABLE_TEMPLATE_SELECTION', DEFAULT_FEATURE_FLAGS.enableTemplateSelection),
  enableCustomDataForms: getEnvFlag('VITE_ENABLE_CUSTOM_DATA_FORMS', DEFAULT_FEATURE_FLAGS.enableCustomDataForms),
  enableProductPreview: getEnvFlag('VITE_ENABLE_PRODUCT_PREVIEW', DEFAULT_FEATURE_FLAGS.enableProductPreview),
  enableBulkOperations: getEnvFlag('VITE_ENABLE_BULK_OPERATIONS', DEFAULT_FEATURE_FLAGS.enableBulkOperations),
};

// Utility functions for checking feature availability
export const isGeneralizedProductsEnabled = (): boolean => FEATURE_FLAGS.enableGeneralizedProducts;

export const isProductTypeEnabled = (productTypeId: string): boolean => {
  switch (productTypeId) {
    case 'calendar':
      return FEATURE_FLAGS.enableProductTypeCalendar;
    case 'storybook':
      return FEATURE_FLAGS.enableProductTypeStorybook;
    case 'interactive_game':
      return FEATURE_FLAGS.enableProductTypeInteractiveGame;
    default:
      return false;
  }
};

export const isTemplateSelectionEnabled = (): boolean => FEATURE_FLAGS.enableTemplateSelection;

export const isCustomDataFormsEnabled = (): boolean => FEATURE_FLAGS.enableCustomDataForms;

export const isProductPreviewEnabled = (): boolean => FEATURE_FLAGS.enableProductPreview;

export const isBulkOperationsEnabled = (): boolean => FEATURE_FLAGS.enableBulkOperations;

// Helper to get all enabled product types
export const getEnabledProductTypes = (): string[] => {
  const types: string[] = [];
  if (FEATURE_FLAGS.enableProductTypeCalendar) types.push('calendar');
  if (FEATURE_FLAGS.enableProductTypeStorybook) types.push('storybook');
  if (FEATURE_FLAGS.enableProductTypeInteractiveGame) types.push('interactive_game');
  return types;
};

// Development helpers
export const logFeatureFlags = (): void => {
  console.log('Current Feature Flags:', FEATURE_FLAGS);
};

export const resetToDefaults = (): void => {
  // This would typically update environment variables or a configuration service
  console.warn('Feature flag reset not implemented - update environment variables manually');
};