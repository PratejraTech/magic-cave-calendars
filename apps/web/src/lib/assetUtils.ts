import { httpClient } from './httpClient';

/**
 * Resolve an asset ID to a publicly accessible URL
 * For now, returns a placeholder URL until the backend asset API is implemented
 */
export async function resolveAssetUrl(assetId?: string): Promise<string | null> {
  if (!assetId) return null;

  try {
    // TODO: Replace with actual API call when backend asset endpoints are ready
    // const response = await httpClient.get<{ url: string }>(`/assets/${assetId}/url`);
    // return response.url;

    // Temporary fallback - return a placeholder image
    if (assetId.includes('photo')) {
      return `https://picsum.photos/400/300?random=${assetId.slice(-1)}`;
    }
    return null;
  } catch (error) {
    console.error('Failed to resolve asset URL:', error);
    return null;
  }
}

/**
 * Get multiple asset URLs at once
 */
export async function resolveAssetUrls(assetIds: (string | undefined)[]): Promise<(string | null)[]> {
  const promises = assetIds.map(assetId => resolveAssetUrl(assetId));
  return Promise.all(promises);
}