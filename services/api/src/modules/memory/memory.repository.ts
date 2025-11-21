import { SupabaseClient } from '@supabase/supabase-js';

export interface MemoryFragment {
  fragment_id: string;
  session_id: string;
  child_id: string;
  content: string;
  importance_score: number;
  created_at: string;
  expires_at: string;
}

export interface MemoryEmbedding {
  embedding_id: string;
  child_id: string;
  content_hash: string;
  content_preview: string;
  embedding_vector: number[];
  source_type: 'chat_message' | 'calendar_day' | 'manual_entry';
  source_id: string;
  relevance_score: number;
  access_count: number;
  last_accessed_at?: string;
  created_at: string;
  expires_at: string;
}

export interface CreateMemoryFragmentData {
  session_id: string;
  child_id: string;
  content: string;
  importance_score?: number;
}

export interface CreateMemoryEmbeddingData {
  child_id: string;
  content_hash: string;
  content_preview: string;
  embedding_vector: number[];
  source_type: 'chat_message' | 'calendar_day' | 'manual_entry';
  source_id: string;
  relevance_score?: number;
}

export interface UpdateMemoryEmbeddingData {
  relevance_score?: number;
  access_count?: number;
  last_accessed_at?: string;
}

export class MemoryRepository {
  constructor(private supabase: SupabaseClient) {}

  // Memory Fragment methods (short-term memory)
  async createFragment(fragmentData: CreateMemoryFragmentData): Promise<MemoryFragment> {
    const { data, error } = await this.supabase
      .from('memory_fragment')
      .insert({
        session_id: fragmentData.session_id,
        child_id: fragmentData.child_id,
        content: fragmentData.content,
        importance_score: fragmentData.importance_score || 0.5,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async findFragmentsBySessionId(sessionId: string, limit = 50): Promise<MemoryFragment[]> {
    const { data, error } = await this.supabase
      .from('memory_fragment')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  async findFragmentsByChildId(childId: string, limit = 100): Promise<MemoryFragment[]> {
    const { data, error } = await this.supabase
      .from('memory_fragment')
      .select('*')
      .eq('child_id', childId)
      .gt('expires_at', new Date().toISOString())
      .order('importance_score', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  async deleteExpiredFragments(): Promise<number> {
    const { count, error } = await this.supabase
      .from('memory_fragment')
      .delete({ count: 'exact' })
      .lt('expires_at', new Date().toISOString());

    if (error) throw error;
    return count || 0;
  }

  // Memory Embedding methods (long-term memory)
  async createEmbedding(embeddingData: CreateMemoryEmbeddingData): Promise<MemoryEmbedding> {
    const { data, error } = await this.supabase
      .from('memory_embedding')
      .insert({
        child_id: embeddingData.child_id,
        content_hash: embeddingData.content_hash,
        content_preview: embeddingData.content_preview,
        embedding_vector: `[${embeddingData.embedding_vector.join(',')}]`,
        source_type: embeddingData.source_type,
        source_id: embeddingData.source_id,
        relevance_score: embeddingData.relevance_score || 0.0,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async findEmbeddingById(embeddingId: string): Promise<MemoryEmbedding | null> {
    const { data, error } = await this.supabase
      .from('memory_embedding')
      .select('*')
      .eq('embedding_id', embeddingId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data;
  }

  async findEmbeddingsByChildId(childId: string, limit = 100): Promise<MemoryEmbedding[]> {
    const { data, error } = await this.supabase
      .from('memory_embedding')
      .select('*')
      .eq('child_id', childId)
      .gt('expires_at', new Date().toISOString())
      .order('relevance_score', { ascending: false })
      .order('last_accessed_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  async findSimilarEmbeddings(childId: string, queryVector: number[], limit = 10): Promise<MemoryEmbedding[]> {
    // Use vector similarity search
    const { data, error } = await this.supabase.rpc('find_similar_embeddings', {
      p_child_id: childId,
      p_query_vector: `[${queryVector.join(',')}]`,
      p_limit: limit
    });

    if (error) throw error;
    return data || [];
  }

  async updateEmbedding(embeddingId: string, updateData: UpdateMemoryEmbeddingData): Promise<MemoryEmbedding> {
    const { data, error } = await this.supabase
      .from('memory_embedding')
      .update(updateData)
      .eq('embedding_id', embeddingId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async incrementAccessCount(embeddingId: string): Promise<void> {
    const { error } = await this.supabase.rpc('increment_embedding_access', {
      p_embedding_id: embeddingId
    });

    if (error) throw error;
  }

  async deleteExpiredEmbeddings(): Promise<number> {
    const { count, error } = await this.supabase
      .from('memory_embedding')
      .delete({ count: 'exact' })
      .lt('expires_at', new Date().toISOString());

    if (error) throw error;
    return count || 0;
  }

  async findEmbeddingByContentHash(childId: string, contentHash: string): Promise<MemoryEmbedding | null> {
    const { data, error } = await this.supabase
      .from('memory_embedding')
      .select('*')
      .eq('child_id', childId)
      .eq('content_hash', contentHash)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data;
  }
}