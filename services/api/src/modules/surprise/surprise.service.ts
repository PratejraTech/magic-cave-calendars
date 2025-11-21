import { SurpriseRepository, UpdateSurpriseConfigData } from './surprise.repository';

export class SurpriseService {
  constructor(private surpriseRepository: SurpriseRepository) {}

  async getSurpriseConfig(calendarId: string) {
    const config = await this.surpriseRepository.findByCalendarId(calendarId);
    if (!config) {
      // Return default empty config if none exists
      return {
        surprise_config_id: '',
        calendar_id: calendarId,
        youtube_urls: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
    return config;
  }

  async updateSurpriseConfig(calendarId: string, updateData: UpdateSurpriseConfigData) {
    // Validate YouTube URLs
    const validatedUrls = await this.validateYouTubeUrls(updateData.youtube_urls);

    // Upsert the config (create if doesn't exist, update if exists)
    return await this.surpriseRepository.upsert(calendarId, validatedUrls);
  }

  async deleteSurpriseConfig(calendarId: string) {
    await this.surpriseRepository.delete(calendarId);
  }

  private async validateYouTubeUrls(urls: string[]): Promise<string[]> {
    const validatedUrls: string[] = [];

    for (const url of urls) {
      if (!url || typeof url !== 'string') {
        throw new Error('Invalid YouTube URL: URL must be a non-empty string');
      }

      // Basic URL validation
      try {
        const urlObj = new URL(url);

        // Must be HTTPS
        if (urlObj.protocol !== 'https:') {
          throw new Error('Invalid YouTube URL: Must use HTTPS');
        }

        // Must be YouTube or YouTube Kids
        const hostname = urlObj.hostname.toLowerCase();
        if (!hostname.includes('youtube.com') && !hostname.includes('youtu.be') &&
            !hostname.includes('youtubekids.com')) {
          throw new Error('Invalid YouTube URL: Must be from YouTube or YouTube Kids');
        }

        validatedUrls.push(url);
      } catch (error) {
        if (error instanceof Error && error.message.includes('Invalid URL')) {
          throw new Error(`Invalid YouTube URL format: ${url}`);
        }
        throw error;
      }
    }

    return validatedUrls;
  }
}