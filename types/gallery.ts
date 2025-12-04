export interface SavedProject {
  id: string;
  user_id: string;
  project_name: string | null;
  product_type: number; // 0=Bilder, 1=Social Media, 2=Video, 3=Logo
  image_url: string;
  thumbnail_url: string | null;
  video_url: string | null;
  generation_params: GenerationParams | null;
  created_at: string;
  updated_at: string;
  is_favorite: boolean;
}

export interface GenerationParams {
  prompt: string;
  aspectRatio?: string;
  resolution?: string;
  outputFormat?: string;
  hasReferenceImages?: boolean;
  imageUrls?: string[];
  // Campaign-specific properties
  isCampaignImage?: boolean;
  imageUrl?: string;
  onEdit?: (editPrompt: string) => void | Promise<void>;
}

export interface FilterOptions {
  productType: number | 'all';
  sortBy: 'newest' | 'oldest' | 'name';
  favorites: boolean;
}

export interface SaveProjectData {
  project_name?: string | null;
  product_type: number;
  image_url: string;
  thumbnail_url?: string | null;
  video_url?: string | null;
  generation_params?: GenerationParams | null;
}

export const PRODUCT_TYPE_NAMES: Record<number, string> = {
  0: 'Bilder',
  1: 'Social Media Paket',
  2: 'Produkt / Service Video',
  3: 'Logo Transformation',
};
