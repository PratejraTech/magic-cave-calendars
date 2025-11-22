import { ProductRepository } from '../product/product.repository';

export class TemplatesService {
  constructor(private productRepository: ProductRepository) {}

  async getAllTemplates() {
    return await this.productRepository.findAllTemplates();
  }

  async getTemplateById(templateId: string) {
    return await this.productRepository.findTemplateById(templateId);
  }

  async getTemplatesByProductType(productTypeId: string) {
    return await this.productRepository.findTemplatesByProductType(productTypeId);
  }

  async validateTemplateForProductType(templateId: string, productTypeId: string): Promise<boolean> {
    const template = await this.productRepository.findTemplateById(templateId);
    if (!template) return false;

    // Check if template is compatible with product type
    return template.product_type_id === productTypeId;
  }

  async getCompatibleThemes(templateId: string): Promise<string[]> {
    const template = await this.productRepository.findTemplateById(templateId);
    return template?.compatible_themes || [];
  }

  async getTemplateCustomDataSchema(templateId: string): Promise<any> {
    const template = await this.productRepository.findTemplateById(templateId);
    return template?.default_custom_data_schema || {};
  }

  async validateCustomData(templateId: string, customData: any): Promise<{ valid: boolean; errors?: string[] }> {
    const schema = await this.getTemplateCustomDataSchema(templateId);

    if (!schema || Object.keys(schema).length === 0) {
      // No schema defined, accept any data
      return { valid: true };
    }

    // Basic validation - check required fields
    const errors: string[] = [];
    const requiredFields = schema.required || [];

    for (const field of requiredFields) {
      if (!(field in customData) || customData[field] === null || customData[field] === undefined || customData[field] === '') {
        errors.push(`Required field '${field}' is missing or empty`);
      }
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  }
}