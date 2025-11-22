import { Router } from 'express';
import { MemoryService } from './memory.service';

const router = Router();

export function createMemoryRoutes(memoryService: MemoryService) {
  // GET /memory/fragments/session/:sessionId - Get memory fragments for a session
  router.get('/fragments/session/:sessionId', async (req, res) => {
    try {
      const { sessionId } = req.params;
      const accountId = req.user?.id;
      if (!accountId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const limit = parseInt(req.query.limit as string) || 50;
      const fragments = await memoryService.getMemoryFragmentsBySession(sessionId, limit);
      res.json(fragments);
    } catch {
      console.error('Memory error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET /memory/fragments/child/:childId - Get memory fragments for a child
  router.get('/fragments/child/:childId', async (req, res) => {
    try {
      const { childId } = req.params;
      const accountId = req.user?.id;
      if (!accountId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const limit = parseInt(req.query.limit as string) || 100;
      const fragments = await memoryService.getMemoryFragmentsByChild(childId, limit);
      res.json(fragments);
    } catch {
      console.error('Memory error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // POST /memory/fragments - Create a new memory fragment
  router.post('/fragments', async (req, res) => {
    try {
      const accountId = req.user?.id;
      if (!accountId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { session_id, child_id, content, importance_score } = req.body;

      if (!session_id || !child_id || !content) {
        return res.status(400).json({ error: 'Missing required fields: session_id, child_id, content' });
      }

      const fragment = await memoryService.createMemoryFragment(
        session_id,
        child_id,
        content,
        importance_score
      );

      res.status(201).json(fragment);
    } catch {
      console.error('Memory error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET /memory/embeddings/child/:childId - Get memory embeddings for a child
  router.get('/embeddings/child/:childId', async (req, res) => {
    try {
      const { childId } = req.params;
      const accountId = req.user?.id;
      if (!accountId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const limit = parseInt(req.query.limit as string) || 100;
      const embeddings = await memoryService.getMemoryEmbeddingsByChild(childId, limit);
      res.json(embeddings);
    } catch {
      console.error('Memory error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // POST /memory/embeddings/search - Find similar memories using vector search
  router.post('/embeddings/search', async (req, res) => {
    try {
      const accountId = req.user?.id;
      if (!accountId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { child_id, query_vector, limit } = req.body;

      if (!child_id || !query_vector || !Array.isArray(query_vector)) {
        return res.status(400).json({ error: 'Missing required fields: child_id, query_vector (array)' });
      }

      const searchLimit = limit || 10;
      const similarMemories = await memoryService.findSimilarMemories(
        child_id,
        query_vector,
        searchLimit
      );

      res.json(similarMemories);
    } catch {
      console.error('Memory error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // POST /memory/embeddings - Create a new memory embedding
  router.post('/embeddings', async (req, res) => {
    try {
      const accountId = req.user?.id;
      if (!accountId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const {
        child_id,
        content_hash,
        content_preview,
        embedding_vector,
        source_type,
        source_id,
        relevance_score
      } = req.body;

      if (!child_id || !content_hash || !content_preview || !embedding_vector || !source_type || !source_id) {
        return res.status(400).json({
          error: 'Missing required fields: child_id, content_hash, content_preview, embedding_vector, source_type, source_id'
        });
      }

      if (!Array.isArray(embedding_vector)) {
        return res.status(400).json({ error: 'embedding_vector must be an array of numbers' });
      }

      const embedding = await memoryService.createMemoryEmbedding(
        child_id,
        content_hash,
        content_preview,
        embedding_vector,
        source_type,
        source_id,
        relevance_score
      );

      res.status(201).json(embedding);
    } catch {
      console.error('Memory error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // PUT /memory/embeddings/:embeddingId/relevance - Update embedding relevance
  router.put('/embeddings/:embeddingId/relevance', async (req, res) => {
    try {
      const { embeddingId } = req.params;
      const accountId = req.user?.id;
      if (!accountId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { relevance_score } = req.body;

      if (typeof relevance_score !== 'number' || relevance_score < 0 || relevance_score > 1) {
        return res.status(400).json({ error: 'relevance_score must be a number between 0 and 1' });
      }

      const updatedEmbedding = await memoryService.updateMemoryEmbeddingRelevance(
        embeddingId,
        relevance_score
      );

      if (!updatedEmbedding) {
        return res.status(404).json({ error: 'Memory embedding not found' });
      }

      res.json(updatedEmbedding);
    } catch {
      console.error('Memory error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // POST /memory/embeddings/:embeddingId/access - Record memory access
  router.post('/embeddings/:embeddingId/access', async (req, res) => {
    try {
      const { embeddingId } = req.params;
      const accountId = req.user?.id;
      if (!accountId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      await memoryService.recordMemoryAccess(embeddingId);
      res.status(200).json({ success: true });
    } catch {
      console.error('Memory error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET /memory/embeddings/check/:childId/:contentHash - Check if embedding exists
  router.get('/embeddings/check/:childId/:contentHash', async (req, res) => {
    try {
      const { childId, contentHash } = req.params;
      const accountId = req.user?.id;
      if (!accountId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const existingEmbedding = await memoryService.getMemoryByContentHash(childId, contentHash);
      res.json({ exists: !!existingEmbedding, embedding: existingEmbedding });
    } catch {
      console.error('Memory error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
}