import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../types/database.types';

export interface CreateProductData {
  account_id: string;
  product_type_id: string;
  title: string;
}

export interface UpdateProductData {
  title?: string;
  status?: 'draft' | 'published' | 'archived';
  is_published?: boolean;
}

export interface CreateProductContentData {
  product_id: string;
  day_number: number;
  content_type?: 'text' | 'image' | 'video' | 'interactive';
  content_data?: any;
}

export interface UpdateProductContentData {
  content_type?: 'text' | 'image' | 'video' | 'interactive';
  content_data?: any;
}

export class ProductRepository {
  constructor(private supabase: SupabaseClient) {}

  // Product methods
  async findById(productId: string): Promise<Database['public']['Tables']['product']['Row'] | null> {
    const { data, error } = await this.supabase
      .from('product')
      .select('*')
      .eq('product_id', productId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data;
  }

  async findByShareUuid(shareUuid: string): Promise<Database['public']['Tables']['product']['Row'] | null> {
    const { data, error } = await this.supabase
      .from('product')
      .select('*')
      .eq('share_uuid', shareUuid)
      .eq('is_published', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data;
  }

  async findByAccountId(accountId: string): Promise<Database['public']['Tables']['product']['Row'][]> {
    const { data, error } = await this.supabase
      .from('product')
      .select('*')
      .eq('account_id', accountId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async create(productData: CreateProductData): Promise<Database['public']['Tables']['product']['Row']> {
    const { data, error } = await this.supabase
      .from('product')
      .insert({
        account_id: productData.account_id,
        product_type_id: productData.product_type_id,
        title: productData.title,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(productId: string, updateData: UpdateProductData): Promise<Database['public']['Tables']['product']['Row']> {
    const { data, error } = await this.supabase
      .from('product')
      .update(updateData)
      .eq('product_id', productId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async delete(productId: string): Promise<void> {
    const { error } = await this.supabase
      .from('product')
      .delete()
      .eq('product_id', productId);

    if (error) throw error;
  }

  // Product Content methods
  async findContentById(contentId: string): Promise<Database['public']['Tables']['product_content']['Row'] | null> {
    const { data, error } = await this.supabase
      .from('product_content')
      .select('*')
      .eq('product_content_id', contentId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data;
  }

  async findContentByProductId(productId: string): Promise<Database['public']['Tables']['product_content']['Row'][]> {
    const { data, error } = await this.supabase
      .from('product_content')
      .select('*')
      .eq('product_id', productId)
      .order('day_number', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async createContent(contentData: CreateProductContentData): Promise<Database['public']['Tables']['product_content']['Row']> {
    const { data, error } = await this.supabase
      .from('product_content')
      .insert({
        product_id: contentData.product_id,
        day_number: contentData.day_number,
        content_type: contentData.content_type || 'text',
        content_data: contentData.content_data || {},
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateContent(contentId: string, updateData: UpdateProductContentData): Promise<Database['public']['Tables']['product_content']['Row']> {
    const { data, error } = await this.supabase
      .from('product_content')
      .update(updateData)
      .eq('product_content_id', contentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteContent(contentId: string): Promise<void> {
    const { error } = await this.supabase
      .from('product_content')
      .delete()
      .eq('product_content_id', contentId);

    if (error) throw error;
  }

  async createEmptyContentForProduct(productId: string, maxDays: number = 24): Promise<void> {
    const content = Array.from({ length: maxDays }, (_, i) => ({
      product_id: productId,
      day_number: i + 1,
      content_type: 'text' as const,
      content_data: {},
    }));

    const { error } = await this.supabase
      .from('product_content')
      .insert(content);

    if (error) throw error;
  }

  // Product Type methods
  async findAllProductTypes(): Promise<Database['public']['Tables']['product_type']['Row'][]> {
    const { data, error } = await this.supabase
      .from('product_type')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async findProductTypeById(productTypeId: string): Promise<Database['public']['Tables']['product_type']['Row'] | null> {
    const { data, error } = await this.supabase
      .from('product_type')
      .select('*')
      .eq('product_type_id', productTypeId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data;
  }

  async findProductTypeByName(name: string): Promise<Database['public']['Tables']['product_type']['Row'] | null> {
    const { data, error } = await this.supabase
      .from('product_type')
      .select('*')
      .eq('name', name)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data;
  }

  // Template methods
  async findAllTemplates(): Promise<Database['public']['Tables']['template_catalog']['Row'][]> {
    const { data, error } = await this.supabase
      .from('template_catalog')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async findTemplatesByProductType(productTypeId: string): Promise<Database['public']['Tables']['template_catalog']['Row'][]> {
    const { data, error } = await this.supabase
      .from('template_catalog')
      .select('*')
      .eq('product_type_id', productTypeId)
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async findTemplateById(templateId: string): Promise<Database['public']['Tables']['template_catalog']['Row'] | null> {
    const { data, error } = await this.supabase
      .from('template_catalog')
      .select('*')
      .eq('template_id', templateId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data;
  }

  // Product Template Linkage methods
  async findTemplateLinkageByProductId(productId: string): Promise<Database['public']['Tables']['product_template_linkage']['Row'] | null> {
    const { data, error } = await this.supabase
      .from('product_template_linkage')
      .select('*')
      .eq('product_id', productId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data;
  }

  async createTemplateLinkage(linkageData: {
    product_id: string;
    template_id: string;
    custom_data?: unknown;
  }): Promise<Database['public']['Tables']['product_template_linkage']['Row']> {
    const { data, error } = await this.supabase
      .from('product_template_linkage')
      .insert({
        product_id: linkageData.product_id,
        template_id: linkageData.template_id,
        custom_data: linkageData.custom_data || {},
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateTemplateLinkage(productId: string, customData: unknown): Promise<Database['public']['Tables']['product_template_linkage']['Row']> {
    const { data, error } = await this.supabase
      .from('product_template_linkage')
      .update({ custom_data: customData })
      .eq('product_id', productId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}