import { Router, Request, Response } from 'express';
import { ProductTypesService } from './product-types.service';

export function createProductTypesRoutes(productTypesService: ProductTypesService): Router {
  const router = Router();

  // GET /api/product-types - List all product types
  router.get('/', async (req: Request, res: Response) => {
    try {
      const productTypes = await productTypesService.getAllProductTypes();
      res.json({
        success: true,
        data: productTypes
      });
    } catch (error) {
      // Error logged:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch product types'
      });
    }
  });

  // GET /api/product-types/:id - Get product type by ID
  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const productType = await productTypesService.getProductTypeById(id);

      if (!productType) {
        return res.status(404).json({
          success: false,
          error: 'Product type not found'
        });
      }

      res.json({
        success: true,
        data: productType
      });
    } catch (error) {
      // Error logged:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch product type'
      });
    }
  });

  // GET /api/product-types/name/:name - Get product type by name
  router.get('/name/:name', async (req: Request, res: Response) => {
    try {
      const { name } = req.params;
      const productType = await productTypesService.getProductTypeByName(name);

      if (!productType) {
        return res.status(404).json({
          success: false,
          error: 'Product type not found'
        });
      }

      res.json({
        success: true,
        data: productType
      });
    } catch (error) {
      // Error logged:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch product type'
      });
    }
  });

  // GET /api/product-types/:id/features - Get supported features for a product type
  router.get('/:id/features', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const features = await productTypesService.getSupportedFeatures(id);

      res.json({
        success: true,
        data: features
      });
    } catch (error) {
      // Error logged:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch product type features'
      });
    }
  });

  // GET /api/product-types/:id/schema - Get default content schema for a product type
  router.get('/:id/schema', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const schema = await productTypesService.getDefaultContentSchema(id);

      res.json({
        success: true,
        data: schema
      });
    } catch (error) {
      // Error logged:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch product type schema'
      });
    }
  });

  // GET /api/product-types/:id/supports/:feature - Check if product type supports a feature
  router.get('/:id/supports/:feature', async (req: Request, res: Response) => {
    try {
      const { id, feature } = req.params;
      const supports = await productTypesService.supportsFeature(id, feature);

      res.json({
        success: true,
        data: {
          product_type_id: id,
          feature: feature,
          supported: supports
        }
      });
    } catch (error) {
      // Error logged:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to check feature support'
      });
    }
  });

  return router;
}