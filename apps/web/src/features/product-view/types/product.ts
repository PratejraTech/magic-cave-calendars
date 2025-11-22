// Product types for the generalized product rendering engine

export type ProductType = 'calendar' | 'storybook' | 'interactive_game';

export interface ProductMetadata {
  id: string;
  product_type_id: ProductType;
  title: string;
  theme?: string;
  child_name?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductContent {
  id: string;
  product_id: string;
  content_number: number; // day_number for calendar, page_number for storybook, level_number for game
  title: string;
  content: string; // message for calendar, page_content for storybook, level_content for game
  media_assets?: {
    photo?: string;
    voice?: string;
    music?: string;
    video?: string;
  };
  metadata?: {
    confetti_type?: 'snow' | 'stars' | 'candy' | 'reindeer';
    unlock_effect?: 'fireworks' | 'snowstorm' | 'aurora' | 'gingerbread';
    [key: string]: any; // Product-specific metadata
  };
  is_unlocked: boolean;
  is_completed: boolean;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductContentResponse {
  product: ProductMetadata;
  content: ProductContent[];
  surprises?: string[]; // URLs for surprise videos
}

export interface ProductRendererProps {
  product: ProductMetadata;
  content: ProductContent[];
  onContentOpen: (contentId: string) => void;
  onContentComplete?: (contentId: string) => void;
  theme?: string;
}