import { MemoryRepository } from './memory.repository';

export class MemoryService {
  constructor(private memoryRepository: MemoryRepository) {}

  // Memory Fragment methods
  async createMemoryFragment(sessionId: string, childId: string, content: string, importanceScore?: number) {
    return await this.memoryRepository.createFragment({
      session_id: sessionId,
      child_id: childId,
      content,
      importance_score: importanceScore,
    });
  }

  async getMemoryFragmentsBySession(sessionId: string, limit = 50) {
    return await this.memoryRepository.findFragmentsBySessionId(sessionId, limit);
  }

  async getMemoryFragmentsByChild(childId: string, limit = 100) {
    return await this.memoryRepository.findFragmentsByChildId(childId, limit);
  }

  async cleanupExpiredFragments() {
    return await this.memoryRepository.deleteExpiredFragments();
  }

  // Memory Embedding methods
  async createMemoryEmbedding(
    childId: string,
    contentHash: string,
    contentPreview: string,
    embeddingVector: number[],
    sourceType: 'chat_message' | 'calendar_day' | 'manual_entry',
    sourceId: string,
    relevanceScore?: number
  ) {
    return await this.memoryRepository.createEmbedding({
      child_id: childId,
      content_hash: contentHash,
      content_preview: contentPreview,
      embedding_vector: embeddingVector,
      source_type: sourceType,
      source_id: sourceId,
      relevance_score: relevanceScore,
    });
  }

  async getMemoryEmbedding(embeddingId: string) {
    return await this.memoryRepository.findEmbeddingById(embeddingId);
  }

  async getMemoryEmbeddingsByChild(childId: string, limit = 100) {
    return await this.memoryRepository.findEmbeddingsByChildId(childId, limit);
  }

  async findSimilarMemories(childId: string, queryVector: number[], limit = 10) {
    return await this.memoryRepository.findSimilarEmbeddings(childId, queryVector, limit);
  }

  async updateMemoryEmbeddingRelevance(embeddingId: string, relevanceScore: number) {
    return await this.memoryRepository.updateEmbedding(embeddingId, {
      relevance_score: relevanceScore,
      last_accessed_at: new Date().toISOString(),
    });
  }

  async recordMemoryAccess(embeddingId: string) {
    return await this.memoryRepository.incrementAccessCount(embeddingId);
  }

  async getMemoryByContentHash(childId: string, contentHash: string) {
    return await this.memoryRepository.findEmbeddingByContentHash(childId, contentHash);
  }

  async cleanupExpiredEmbeddings() {
    return await this.memoryRepository.deleteExpiredEmbeddings();
  }
}