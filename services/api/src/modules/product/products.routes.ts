import { Router, Request, Response } from 'express';
import { ProductService } from './product.service';
import { TemplatesService } from '../templates/templates.service';

export function createProductsRoutes(
  productService: ProductService,
  templatesService: TemplatesService
): Router {
  const router = Router();

  // GET /api/products - List user's products
  router.get('/', async (req: Request, res: Response) => {
    try {
      // TODO: Get account_id from authentication context
      // For now, using a placeholder - this will be fixed when auth is implemented
      const accountId = req.headers['x-account-id'] as string;

      if (!accountId) {
        return res.status(400).json({
          success: false,
          error: 'Account ID required'
        });
      }

      const products = await productService.getProductsByAccountId(accountId);
      res.json({
        success: true,
        data: products
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch products'
      });
    }
  });

  // POST /api/products - Create new product
  router.post('/', async (req: Request, res: Response) => {
    try {
      const { product_type_id, title, template_id, custom_data } = req.body;

      // TODO: Get account_id from authentication context
      const accountId = req.headers['x-account-id'] as string;

      if (!accountId) {
        return res.status(400).json({
          success: false,
          error: 'Account ID required'
        });
      }

      if (!product_type_id || !title) {
        return res.status(400).json({
          success: false,
          error: 'product_type_id and title are required'
        });
      }

      // Validate product type exists
      const isValidType = await productService.getProductTypeById(product_type_id);
      if (!isValidType) {
        return res.status(400).json({
          success: false,
          error: 'Invalid product type'
        });
      }

      // Create the product
      const product = await productService.createProduct({
        account_id: accountId,
        product_type_id,
        title
      });

      // Apply template if provided
      if (template_id) {
        // Validate template compatibility
        const isCompatible = await templatesService.validateTemplateForProductType(template_id, product_type_id);
        if (!isCompatible) {
          return res.status(400).json({
            success: false,
            error: 'Template is not compatible with this product type'
          });
        }

        // Validate custom data if provided
        if (custom_data) {
          const validation = await templatesService.validateCustomData(template_id, custom_data);
          if (!validation.valid) {
            return res.status(400).json({
              success: false,
              error: 'Invalid custom data',
              details: validation.errors
            });
          }
        }

        // Apply template to product
        await productService.applyTemplateToProduct(product.product_id, template_id, custom_data);
      }

      res.status(201).json({
        success: true,
        data: product
      });
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create product'
      });
    }
  });

  // GET /api/products/:id - Get product by ID
  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const product = await productService.getProductById(id);

      res.json({
        success: true,
        data: product
      });
    } catch (error) {
      console.error('Error fetching product:', error);
      if (error.message === 'Product not found') {
        return res.status(404).json({
          success: false,
          error: 'Product not found'
        });
      }
      res.status(500).json({
        success: false,
        error: 'Failed to fetch product'
      });
    }
  });

  // PUT /api/products/:id - Update product
  router.put('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { title, status } = req.body;

      const updateData: any = {};
      if (title !== undefined) updateData.title = title;
      if (status !== undefined) updateData.status = status;

      const product = await productService.updateProduct(id, updateData);

      res.json({
        success: true,
        data: product
      });
    } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update product'
      });
    }
  });

  // DELETE /api/products/:id - Delete product
  router.delete('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await productService.deleteProduct(id);

      res.json({
        success: true,
        message: 'Product deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete product'
      });
    }
  });

  // POST /api/products/:id/publish - Publish product
  router.post('/:id/publish', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const product = await productService.publishProduct(id);

      res.json({
        success: true,
        data: product
      });
    } catch (error) {
      console.error('Error publishing product:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to publish product'
      });
    }
  });

  // GET /api/products/:id/content - Get product content
  router.get('/:id/content', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const content = await productService.getProductContent(id);

      res.json({
        success: true,
        data: content
      });
    } catch (error) {
      console.error('Error fetching product content:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch product content'
      });
    }
  });

  // PUT /api/products/:id/content - Update product content
  router.put('/:id/content', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { content_updates } = req.body;

      if (!content_updates || !Array.isArray(content_updates)) {
        return res.status(400).json({
          success: false,
          error: 'content_updates array is required'
        });
      }

      const results = await productService.updateProductContents(id, content_updates);

      res.json({
        success: true,
        data: results
      });
    } catch (error) {
      console.error('Error updating product content:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update product content'
      });
    }
  });

  // GET /api/products/:id/template - Get product template linkage
  router.get('/:id/template', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const linkage = await productService.getTemplateLinkageByProductId(id);

      if (!linkage) {
        return res.json({
          success: true,
          data: null
        });
      }

      res.json({
        success: true,
        data: linkage
      });
    } catch (error) {
      console.error('Error fetching product template:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch product template'
      });
    }
  });

  // PUT /api/products/:id/template - Apply or update template
  router.put('/:id/template', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { template_id, custom_data } = req.body;

      if (!template_id) {
        return res.status(400).json({
          success: false,
          error: 'template_id is required'
        });
      }

      // Get product to check product type
      const product = await productService.getProductById(id);

      // Validate template compatibility
      const isCompatible = await templatesService.validateTemplateForProductType(template_id, product.product_type_id);
      if (!isCompatible) {
        return res.status(400).json({
          success: false,
          error: 'Template is not compatible with this product type'
        });
      }

      // Validate custom data if provided
      if (custom_data) {
        const validation = await templatesService.validateCustomData(template_id, custom_data);
        if (!validation.valid) {
          return res.status(400).json({
            success: false,
            error: 'Invalid custom data',
            details: validation.errors
          });
        }
      }

      const linkage = await productService.applyTemplateToProduct(id, template_id, custom_data);

      res.json({
        success: true,
        data: linkage
      });
    } catch (error) {
      console.error('Error applying template to product:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to apply template'
      });
    }
  });

  return router;
}