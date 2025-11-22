import { ProductRepository } from './product.repository';

export class ProductTypesService {
  constructor(private productRepository: ProductRepository) {}

  async getAllProductTypes() {
    return await this.productRepository.findAllProductTypes();
  }

  async getProductTypeById(productTypeId: string) {
    return await this.productRepository.findProductTypeById(productTypeId);
  }

  async getProductTypeByName(name: string) {
    return await this.productRepository.findProductTypeByName(name);
  }

  async validateProductType(productTypeId: string): Promise<boolean> {
    const productType = await this.productRepository.findProductTypeById(productTypeId);
    return !!productType;
  }

  async getSupportedFeatures(productTypeId: string): Promise<string[]> {
    const productType = await this.productRepository.findProductTypeById(productTypeId);
    return productType?.supported_features || [];
  }

  async getDefaultContentSchema(productTypeId: string): Promise<any> {
    const productType = await this.productRepository.findProductTypeById(productTypeId);
    return productType?.default_content_schema || {};
  }

  async supportsFeature(productTypeId: string, feature: string): Promise<boolean> {
    const features = await this.getSupportedFeatures(productTypeId);
    return features.includes(feature);
  }
}