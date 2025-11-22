import { ProductRepository, CreateProductData, UpdateProductData, CreateProductContentData, UpdateProductContentData } from './product.repository';

export class ProductService {
  constructor(private productRepository: ProductRepository) {}

  // Product methods
  async getProductById(productId: string) {
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }
    return product;
  }

  async getProductByShareUuid(shareUuid: string) {
    const product = await this.productRepository.findByShareUuid(shareUuid);
    if (!product) {
      throw new Error('Product not found or not published');
    }
    return product;
  }

  async getProductsByAccountId(accountId: string) {
    return await this.productRepository.findByAccountId(accountId);
  }

  async createProduct(productData: CreateProductData) {
    const product = await this.productRepository.create(productData);

    // Create empty content for the product based on product type
    const productType = await this.productRepository.findProductTypeById(productData.product_type_id);
    const maxDays = productType?.name === 'calendar' ? 24 : 10; // Default to 10 for other types

    await this.productRepository.createEmptyContentForProduct(product.product_id, maxDays);

    return product;
  }

  async updateProduct(productId: string, updateData: UpdateProductData) {
    return await this.productRepository.update(productId, updateData);
  }

  async publishProduct(productId: string) {
    return await this.productRepository.update(productId, { is_published: true, status: 'published' });
  }

  async unpublishProduct(productId: string) {
    return await this.productRepository.update(productId, { is_published: false });
  }

  async deleteProduct(productId: string) {
    // Verify product exists
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    await this.productRepository.delete(productId);
  }

  // Product Content methods
  async getProductContent(productId: string) {
    // Verify product exists and is accessible
    await this.getProductById(productId);

    return await this.productRepository.findContentByProductId(productId);
  }

  async getProductContentItem(contentId: string) {
    const content = await this.productRepository.findContentById(contentId);
    if (!content) {
      throw new Error('Product content not found');
    }
    return content;
  }

  async updateProductContent(contentId: string, updateData: UpdateProductContentData) {
    // Verify the content exists
    const existingContent = await this.productRepository.findContentById(contentId);
    if (!existingContent) {
      throw new Error('Product content not found');
    }

    return await this.productRepository.updateContent(contentId, updateData);
  }

  async updateProductContents(productId: string, contentUpdates: Array<{
    day_number: number;
    content_data?: any;
  }>) {
    // Verify product exists
    await this.getProductById(productId);

    // Get existing content
    const existingContent = await this.productRepository.findContentByProductId(productId);
    const existingContentMap = new Map(
      existingContent.map(content => [content.day_number, content])
    );

    // Update each content item
    const results: any[] = [];
    for (const update of contentUpdates) {
      const existingItem = existingContentMap.get(update.day_number);
      if (!existingItem) {
        throw new Error(`Content ${update.day_number} not found in product`);
      }

      const result = await this.productRepository.updateContent(existingItem.product_content_id, {
        content_data: update.content_data,
      });
      results.push(result);
    }

    return results;
  }

  // Product Type methods
  async getAllProductTypes() {
    return await this.productRepository.findAllProductTypes();
  }

  async getProductTypeById(productTypeId: string) {
    const productType = await this.productRepository.findProductTypeById(productTypeId);
    if (!productType) {
      throw new Error('Product type not found');
    }
    return productType;
  }

  async getProductTypeByName(name: string) {
    const productType = await this.productRepository.findProductTypeByName(name);
    if (!productType) {
      throw new Error('Product type not found');
    }
    return productType;
  }

  // Template methods
  async getAllTemplates() {
    return await this.productRepository.findAllTemplates();
  }

  async getTemplatesByProductType(productTypeId: string) {
    return await this.productRepository.findTemplatesByProductType(productTypeId);
  }

  async getTemplateById(templateId: string) {
    const template = await this.productRepository.findTemplateById(templateId);
    if (!template) {
      throw new Error('Template not found');
    }
    return template;
  }

  // Product Template Linkage methods
  async getTemplateLinkageByProductId(productId: string) {
    return await this.productRepository.findTemplateLinkageByProductId(productId);
  }

  async applyTemplateToProduct(productId: string, templateId: string, customData?: any) {
    // Verify product and template exist
    await this.getProductById(productId);
    await this.getTemplateById(templateId);

    // Check if linkage already exists
    const existingLinkage = await this.productRepository.findTemplateLinkageByProductId(productId);
    if (existingLinkage) {
      // Update existing linkage
      return await this.productRepository.updateTemplateLinkage(productId, customData || {});
    } else {
      // Create new linkage
      return await this.productRepository.createTemplateLinkage({
        product_id: productId,
        template_id: templateId,
        custom_data: customData || {},
      });
    }
  }

  async updateProductCustomData(productId: string, customData: any) {
    const linkage = await this.productRepository.findTemplateLinkageByProductId(productId);
    if (!linkage) {
      throw new Error('Product does not have a template applied');
    }

    return await this.productRepository.updateTemplateLinkage(productId, customData);
  }
}