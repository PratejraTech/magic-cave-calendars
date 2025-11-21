import { Router } from 'express';
import { ChildService } from './child.service';

const router = Router();

export function createChildRoutes(childService: ChildService) {
  // GET /child - Get child for current account
  router.get('/', async (req, res) => {
    try {
      const accountId = req.user?.id;
      if (!accountId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const child = await childService.getChildByAccountId(accountId);
      res.json(child);
    } catch (error) {
      console.error('Error fetching child:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // POST /child - Create new child
  router.post('/', async (req, res) => {
    try {
      const accountId = req.user?.id;
      if (!accountId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { child_name, hero_photo_url, chat_persona, custom_chat_prompt, theme } = req.body;

      if (!child_name || !chat_persona) {
        return res.status(400).json({ error: 'child_name and chat_persona are required' });
      }

      const child = await childService.createChild({
        account_id: accountId,
        child_name,
        hero_photo_url,
        chat_persona,
        custom_chat_prompt,
        theme: theme || 'default'
      });

      res.status(201).json(child);
    } catch (error) {
      console.error('Error creating child:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET /child/:childId - Get specific child
  router.get('/:childId', async (req, res) => {
    try {
      const accountId = req.user?.id;
      if (!accountId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { childId } = req.params;
      const child = await childService.getChildById(childId);

      // Ensure the child belongs to the current account
      if (child.account_id !== accountId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      res.json(child);
    } catch (error) {
      console.error('Error fetching child:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // PUT /child/:childId - Update child
  router.put('/:childId', async (req, res) => {
    try {
      const accountId = req.user?.id;
      if (!accountId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { childId } = req.params;
      const updateData = req.body;

      // First check if child exists and belongs to account
      const existingChild = await childService.getChildById(childId);
      if (existingChild.account_id !== accountId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const updatedChild = await childService.updateChild(childId, updateData);
      res.json(updatedChild);
    } catch (error) {
      console.error('Error updating child:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // DELETE /child/:childId - Delete child
  router.delete('/:childId', async (req, res) => {
    try {
      const accountId = req.user?.id;
      if (!accountId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { childId } = req.params;

      // First check if child exists and belongs to account
      const existingChild = await childService.getChildById(childId);
      if (existingChild.account_id !== accountId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      await childService.deleteChild(childId);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting child:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
}