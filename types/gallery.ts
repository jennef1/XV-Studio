// Workflow type enum for granular tracking
export type WorkflowType =
  | 'product_rotation'
  | 'ai_explains'
  | 'user_speaks'
  | 'campaign_images'
  | 'bilder_product'
  | 'bilder_combine'
  | 'bilder_freebird'
  | 'logo_transformation'
  | 'image_to_video';

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
  campaign_job_id: string | null;
  workflow_type: WorkflowType | null;
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
  // NEW: Tracking properties
  workflow?: WorkflowType;
  jobId?: string; // campaign_generation_jobs.id
  productCategory?: string; // From business_products.category
  productName?: string;
  selectedImage?: string;
  businessId?: string;
  productId?: string;
  generationCount?: number;
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
  campaign_job_id?: string | null;
  workflow_type?: WorkflowType | null;
}

export interface ProjectTracking {
  id: string;
  saved_project_id: string;
  campaign_job_id: string | null;
  user_id: string;
  business_id: string | null;
  product_id: string | null;
  workflow_type: WorkflowType;
  product_category: string | null;
  generation_count: number;
  edit_count: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectEditHistory {
  id: string;
  project_tracking_id: string;
  saved_project_id: string;
  edit_type: 'generation' | 'edit';
  edit_number: number;
  prompt: string;
  result_url: string;
  metadata: {
    aspectRatio?: string;
    resolution?: string;
    outputFormat?: string;
    selectedImage?: string;
    productName?: string;
    [key: string]: any;
  } | null;
  created_at: string;
}

export const PRODUCT_TYPE_NAMES: Record<number, string> = {
  0: 'Bilder',
  1: 'Social Media Boost',
  2: 'Produkt / Service Video',
  3: 'Logo Transformation',
};
