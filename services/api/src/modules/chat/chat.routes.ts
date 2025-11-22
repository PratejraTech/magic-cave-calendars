import { Router } from 'express';
import { ChatService } from './chat.service';

const router = Router();

export function createChatRoutes(chatService: ChatService) {
  // POST /chat/session - Create new chat session
  router.post('/session', async (req, res) => {
    try {
      const accountId = req.user?.id;
      if (!accountId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { child_id, session_id } = req.body;

      if (!child_id || !session_id) {
        return res.status(400).json({ error: 'child_id and session_id are required' });
      }

      const session = await chatService.createChatSession({
        account_id: accountId,
        child_id,
        session_id,
      });

      res.status(201).json(session);
    } catch (error) {
      // Error logged:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET /chat/session/:sessionId - Get chat session
  router.get('/session/:sessionId', async (req, res) => {
    try {
      const { sessionId } = req.params;
      const accountId = req.user?.id;

      const session = await chatService.getChatSession(sessionId);

      // Check ownership
      if (session.account_id !== accountId) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      res.json(session);
    } catch (error) {
      if (error.message === 'Chat session not found') {
        return res.status(404).json({ error: 'Chat session not found' });
      }
      // Error logged:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET /chat/history/:childId - Get chat history for child
  router.get('/history/:childId', async (req, res) => {
    try {
      const { childId } = req.params;
      const accountId = req.user?.id;
      const limit = parseInt(req.query.limit as string) || 50;

      if (!accountId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Verify child ownership
      const childService = (await import('../child/child.service')).ChildService;
      const childRepository = (await import('../child/child.repository')).ChildRepository;
      const supabase = (await import('../../lib/supabaseClient')).supabase;
      const childRepo = new childRepository(supabase);
      const childSvc = new childService(childRepo);

      const child = await childSvc.getChildById(childId);
      if (child.account_id !== accountId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const history = await chatService.getChatHistory(childId, limit);
      res.json(history);
    } catch (error) {
      if (error.message === 'Child not found') {
        return res.status(404).json({ error: 'Child not found' });
      }
      // Error logged:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET /chat/messages/:chatRecordId - Get messages for chat session
  router.get('/messages/:chatRecordId', async (req, res) => {
    try {
      const { chatRecordId } = req.params;
      const accountId = req.user?.id;
      const limit = parseInt(req.query.limit as string) || 100;

      if (!accountId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Chat ownership verification - implement when auth is added

      const messages = await chatService.getChatMessages(chatRecordId, limit);
      res.json(messages);
    } catch (error) {
      // Error logged:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // POST /chat/message - Add child message and get streaming response from intelligence service
  router.post('/message', async (req, res) => {
    try {
      const accountId = req.user?.id;
      if (!accountId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { session_id, message, persona_config } = req.body;

      if (!session_id || !message) {
        return res.status(400).json({ error: 'session_id and message are required' });
      }

      // Get session to verify ownership and get child_id
      const session = await chatService.getChatSession(session_id);
      if (session.account_id !== accountId) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      // Add child message to database
      const result = await chatService.addChildMessage(session_id, message);

      // Get streaming response from intelligence service
      const streamingResponse = await chatService.streamChatResponse(
        session_id,
        session.child_id,
        message,
        persona_config
      );

      res.json({
        session: result.session,
        child_message: result.message,
        ai_response: streamingResponse.response,
        finished: streamingResponse.finished,
      });
    } catch (error) {
      // Error logged:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
}