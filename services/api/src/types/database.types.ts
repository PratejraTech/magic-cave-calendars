// Database type definitions for generalized product system

export interface ProductType {
  product_type_id: string;
  name: string;
  description: string | null;
  default_content_schema: any; // JSONB
  supported_features: string[];
  created_at: string;
  updated_at: string;
}

export interface Product {
  product_id: string;
  account_id: string;
  product_type_id: string;
  title: string;
  status: 'draft' | 'published' | 'archived';
  share_uuid: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductContent {
  product_content_id: string;
  product_id: string;
  day_number: number;
  content_type: 'text' | 'image' | 'video' | 'interactive';
  content_data: any; // JSONB
  generated_at: string | null;
  created_at: string;
}

export interface TemplateCatalog {
  template_id: string;
  product_type_id: string | null;
  name: string;
  description: string | null;
  preview_image_url: string | null;
  compatible_themes: string[];
  default_custom_data_schema: any; // JSONB
  product_specific_config: any; // JSONB
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductTemplateLinkage {
  product_template_id: string;
  product_id: string;
  template_id: string;
  custom_data: any; // JSONB
  applied_at: string;
}

// Legacy calendar types (for backward compatibility)
export interface Calendar {
  calendar_id: string;
  account_id: string;
  child_id: string;
  share_uuid: string;
  is_published: boolean;
  year: number;
  created_at: string;
}

export interface CalendarDay {
  day_id: string;
  calendar_id: string;
  day_number: number;
  photo_url?: string;
  text_content?: string;
  created_at: string;
}

// Supabase client type
export interface Database {
  public: {
    Tables: {
      product_type: {
        Row: ProductType;
        Insert: Omit<ProductType, 'product_type_id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<ProductType, 'product_type_id'>>;
      };
      product: {
        Row: Product;
        Insert: Omit<Product, 'product_id' | 'share_uuid' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Product, 'product_id'>>;
      };
      product_content: {
        Row: ProductContent;
        Insert: Omit<ProductContent, 'product_content_id' | 'created_at'>;
        Update: Partial<Omit<ProductContent, 'product_content_id'>>;
      };
      template_catalog: {
        Row: TemplateCatalog;
        Insert: Omit<TemplateCatalog, 'template_id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<TemplateCatalog, 'template_id'>>;
      };
      product_template_linkage: {
        Row: ProductTemplateLinkage;
        Insert: Omit<ProductTemplateLinkage, 'product_template_id' | 'applied_at'>;
        Update: Partial<Omit<ProductTemplateLinkage, 'product_template_id'>>;
      };
      // Legacy tables
      advent_calendar_v2: {
        Row: Calendar;
        Insert: Omit<Calendar, 'calendar_id' | 'share_uuid' | 'created_at'>;
        Update: Partial<Omit<Calendar, 'calendar_id'>>;
      };
      calendar_day_v2: {
        Row: CalendarDay;
        Insert: Omit<CalendarDay, 'day_id' | 'created_at'>;
        Update: Partial<Omit<CalendarDay, 'day_id'>>;
      };
    };
  };
}