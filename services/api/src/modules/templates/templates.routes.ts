import { Router, Request, Response } from 'express';
import { TemplatesService } from './templates.service';

export function createTemplatesRoutes(templatesService: TemplatesService): Router {
  const router = Router();

  // GET /api/templates - List all active templates
  router.get('/', async (req: Request, res: Response) => {
    try {
      const templates = await templatesService.getAllTemplates();
      res.json({
        success: true,
        data: templates
      });
    } catch (error) {
      // Error logged:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch templates'
      });
    }
  });

  // GET /api/templates/:id - Get template by ID
  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const template = await templatesService.getTemplateById(id);

      if (!template) {
        return res.status(404).json({
          success: false,
          error: 'Template not found'
        });
      }

      res.json({
        success: true,
        data: template
      });
    } catch (error) {
      // Error logged:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch template'
      });
    }
  });

  // GET /api/templates/product-type/:productTypeId - Get templates for a product type
  router.get('/product-type/:productTypeId', async (req: Request, res: Response) => {
    try {
      const { productTypeId } = req.params;
      const templates = await templatesService.getTemplatesByProductType(productTypeId);

      res.json({
        success: true,
        data: templates
      });
    } catch (error) {
      // Error logged:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch templates'
      });
    }
  });

  // GET /api/templates/:id/themes - Get compatible themes for a template
  router.get('/:id/themes', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const themes = await templatesService.getCompatibleThemes(id);

      res.json({
        success: true,
        data: themes
      });
    } catch (error) {
      // Error logged:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch template themes'
      });
    }
  });

  // GET /api/templates/:id/schema - Get custom data schema for a template
  router.get('/:id/schema', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const schema = await templatesService.getTemplateCustomDataSchema(id);

      res.json({
        success: true,
        data: schema
      });
    } catch (error) {
      // Error logged:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch template schema'
      });
    }
  });

  // POST /api/templates/:id/validate - Validate custom data against template schema
  router.post('/:id/validate', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { customData } = req.body;

      if (!customData) {
        return res.status(400).json({
          success: false,
          error: 'customData is required'
        });
      }

      const validation = await templatesService.validateCustomData(id, customData);

      res.json({
        success: true,
        data: validation
      });
    } catch (error) {
      // Error logged:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to validate custom data'
      });
    }
  });

  // GET /api/templates/:templateId/compatible/:productTypeId - Check template compatibility
  router.get('/:templateId/compatible/:productTypeId', async (req: Request, res: Response) => {
    try {
      const { templateId, productTypeId } = req.params;
      const isCompatible = await templatesService.validateTemplateForProductType(templateId, productTypeId);

      res.json({
        success: true,
        data: {
          template_id: templateId,
          product_type_id: productTypeId,
          compatible: isCompatible
        }
      });
    } catch (error) {
      // Error logged:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to check compatibility'
      });
    }
  });

  return router;
}