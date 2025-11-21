import { Router } from 'express';
import { ChildService } from './child.service';

const router = Router();

export function createChildRoutes(childService: ChildService) {
  // GET /children - Get child for account
  router.get('/', async (req, res) => {
    try {
      const accountId = req.user?.id; // From auth middleware
      if (!accountId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const child = await childService.getChildByAccountId(accountId);
      if (!child) {
        return res.status(404).json({ error: 'Child not found' });
      }

      res.json(child);
    } catch (error) {
      console.error('Error fetching child:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET /children/:childId - Get child by ID
  router.get('/:childId', async (req, res) => {
    try {
      const { childId } = req.params;
      const accountId = req.user?.id;

      const child = await childService.getChildById(childId);

      // Check if user owns this child
      if (child.account_id !== accountId) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      res.json(child);
    } catch (error) {
      if (error.message === 'Child not found') {
        return res.status(404).json({ error: 'Child not found' });
      }
      console.error('Error fetching child:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // POST /children - Create new child
  router.post('/', async (req, res) => {
    try {
      const accountId = req.user?.id;
      if (!accountId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { child_name, hero_photo_url, chat_persona, custom_chat_prompt, theme } = req.body;

      if (!child_name) {
        return res.status(400).json({ error: 'child_name is required' });
      }

      if (!chat_persona || !['mummy', 'daddy', 'custom'].includes(chat_persona)) {
        return res.status(400).json({ error: 'Valid chat_persona is required (mummy, daddy, or custom)' });
      }

      if (chat_persona === 'custom' && !custom_chat_prompt) {
        return res.status(400).json({ error: 'custom_chat_prompt is required when chat_persona is custom' });
      }

      const child = await childService.createChild({
        account_id: accountId,
        child_name,
        hero_photo_url,
        chat_persona,
        custom_chat_prompt,
        theme: theme || 'snow',
      });

      res.status(201).json(child);
    } catch (error) {
      if (error.message.includes('already has a child')) {
        return res.status(409).json({ error: error.message });
      }
      if (error.message.includes('Invalid chat persona')) {
        return res.status(400).json({ error: error.message });
      }
      console.error('Error creating child:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // PUT /children/:childId - Update child
  router.put('/:childId', async (req, res) => {
    try {
      const { childId } = req.params;
      const accountId = req.user?.id;
      const updateData = req.body;

      // Verify ownership
      const existingChild = await childService.getChildById(childId);
      if (existingChild.account_id !== accountId) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      // Validate update data
      if (updateData.chat_persona && !['mummy', 'daddy', 'custom'].includes(updateData.chat_persona)) {
        return res.status(400).json({ error: 'Invalid chat_persona' });
      }

      const updatedChild = await childService.updateChild(childId, updateData);
      res.json(updatedChild);
    } catch (error) {
      if (error.message === 'Child not found') {
        return res.status(404).json({ error: 'Child not found' });
      }
      console.error('Error updating child:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // DELETE /children/:childId - Delete child
  router.delete('/:childId', async (req, res) => {
    try {
      const { childId } = req.params;
      const accountId = req.user?.id;

      // Verify ownership
      const child = await childService.getChildById(childId);
      if (child.account_id !== accountId) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      await childService.deleteChild(childId);
      res.status(204).send();
    } catch (error) {
      if (error.message === 'Child not found') {
        return res.status(404).json({ error: 'Child not found' });
      }
      console.error('Error deleting child:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
}