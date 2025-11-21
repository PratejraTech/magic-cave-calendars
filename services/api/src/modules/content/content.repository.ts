import { SupabaseClient } from '@supabase/supabase-js';

export interface MediaAsset {
  asset_id: string;
  account_id: string;
  asset_type: 'photo' | 'voice' | 'music' | 'video';
  filename: string;
  original_filename: string;
  mime_type: string;
  file_size_bytes: number;
  storage_path: string;
  public_url?: string;
  signed_url_expires_at?: string;
  metadata: any;
  is_processed: boolean;
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface SurpriseCollection {
  collection_id: string;
  calendar_id: string;
  title: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SurpriseVideo {
  video_id: string;
  collection_id: string;
  youtube_video_id: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  duration_seconds?: number;
  view_count?: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface CreateMediaAssetData {
  account_id: string;
  asset_type: 'photo' | 'voice' | 'music' | 'video';
  filename: string;
  original_filename: string;
  mime_type: string;
  file_size_bytes: number;
  storage_path: string;
  public_url?: string;
  metadata?: any;
}

export interface CreateSurpriseCollectionData {
  calendar_id: string;
  title?: string;
  description?: string;
}

export interface CreateSurpriseVideoData {
  collection_id: string;
  youtube_video_id: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  duration_seconds?: number;
  sort_order?: number;
}

export interface UpdateSurpriseCollectionData {
  title?: string;
  description?: string;
  is_active?: boolean;
}

export interface UpdateSurpriseVideoData {
  title?: string;
  description?: string;
  thumbnail_url?: string;
  duration_seconds?: number;
  view_count?: number;
  is_active?: boolean;
  sort_order?: number;
}

export class ContentRepository {
  constructor(private supabase: SupabaseClient) {}

  // Media Asset methods
  async createMediaAsset(assetData: CreateMediaAssetData): Promise<MediaAsset> {
    const { data, error } = await this.supabase
      .from('media_asset')
      .insert({
        account_id: assetData.account_id,
        asset_type: assetData.asset_type,
        filename: assetData.filename,
        original_filename: assetData.original_filename,
        mime_type: assetData.mime_type,
        file_size_bytes: assetData.file_size_bytes,
        storage_path: assetData.storage_path,
        public_url: assetData.public_url,
        metadata: assetData.metadata || {},
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async findMediaAssetById(assetId: string): Promise<MediaAsset | null> {
    const { data, error } = await this.supabase
      .from('media_asset')
      .select('*')
      .eq('asset_id', assetId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data;
  }

  async findMediaAssetsByAccountId(accountId: string, assetType?: string): Promise<MediaAsset[]> {
    let query = this.supabase
      .from('media_asset')
      .select('*')
      .eq('account_id', accountId)
      .order('created_at', { ascending: false });

    if (assetType) {
      query = query.eq('asset_type', assetType);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  async updateMediaAsset(assetId: string, updates: Partial<MediaAsset>): Promise<MediaAsset> {
    const { data, error } = await this.supabase
      .from('media_asset')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('asset_id', assetId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteMediaAsset(assetId: string): Promise<void> {
    const { error } = await this.supabase
      .from('media_asset')
      .delete()
      .eq('asset_id', assetId);

    if (error) throw error;
  }

  // Surprise Collection methods
  async findSurpriseCollectionByCalendarId(calendarId: string): Promise<SurpriseCollection | null> {
    const { data, error } = await this.supabase
      .from('surprise_collection_v2')
      .select('*')
      .eq('calendar_id', calendarId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data;
  }

  async createSurpriseCollection(collectionData: CreateSurpriseCollectionData): Promise<SurpriseCollection> {
    const { data, error } = await this.supabase
      .from('surprise_collection_v2')
      .insert({
        calendar_id: collectionData.calendar_id,
        title: collectionData.title || 'Surprise Videos',
        description: collectionData.description,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateSurpriseCollection(collectionId: string, updateData: UpdateSurpriseCollectionData): Promise<SurpriseCollection> {
    const { data, error } = await this.supabase
      .from('surprise_collection_v2')
      .update(updateData)
      .eq('collection_id', collectionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteSurpriseCollection(collectionId: string): Promise<void> {
    const { error } = await this.supabase
      .from('surprise_collection_v2')
      .delete()
      .eq('collection_id', collectionId);

    if (error) throw error;
  }

  // Surprise Video methods
  async findSurpriseVideosByCollectionId(collectionId: string): Promise<SurpriseVideo[]> {
    const { data, error } = await this.supabase
      .from('surprise_video')
      .select('*')
      .eq('collection_id', collectionId)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async createSurpriseVideo(videoData: CreateSurpriseVideoData): Promise<SurpriseVideo> {
    const { data, error } = await this.supabase
      .from('surprise_video')
      .insert({
        collection_id: videoData.collection_id,
        youtube_video_id: videoData.youtube_video_id,
        title: videoData.title,
        description: videoData.description,
        thumbnail_url: videoData.thumbnail_url,
        duration_seconds: videoData.duration_seconds,
        sort_order: videoData.sort_order || 0,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateSurpriseVideo(videoId: string, updateData: UpdateSurpriseVideoData): Promise<SurpriseVideo> {
    const { data, error } = await this.supabase
      .from('surprise_video')
      .update(updateData)
      .eq('video_id', videoId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteSurpriseVideo(videoId: string): Promise<void> {
    const { error } = await this.supabase
      .from('surprise_video')
      .delete()
      .eq('video_id', videoId);

    if (error) throw error;
  }

  // Legacy compatibility methods for existing API
  async getSurpriseVideosForCalendar(calendarId: string): Promise<string[]> {
    const collection = await this.findSurpriseCollectionByCalendarId(calendarId);
    if (!collection) return [];

    const videos = await this.findSurpriseVideosByCollectionId(collection.collection_id);
    return videos.map(video => video.youtube_video_id);
  }

  async setSurpriseVideosForCalendar(calendarId: string, youtubeVideoIds: string[]): Promise<void> {
    // Find or create collection
    let collection = await this.findSurpriseCollectionByCalendarId(calendarId);
    if (!collection) {
      collection = await this.createSurpriseCollection({ calendar_id: calendarId });
    }

    // Delete existing videos
    const existingVideos = await this.findSurpriseVideosByCollectionId(collection.collection_id);
    for (const video of existingVideos) {
      await this.deleteSurpriseVideo(video.video_id);
    }

    // Add new videos
    for (let i = 0; i < youtubeVideoIds.length; i++) {
      await this.createSurpriseVideo({
        collection_id: collection.collection_id,
        youtube_video_id: youtubeVideoIds[i],
        title: `Video ${i + 1}`,
        sort_order: i,
      });
    }
  }
}