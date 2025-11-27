export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      messages: {
        Row: {
          id: string;
          content: string;
          aspect_ratio: string | null;
          duration: string | null;
          attachment_path: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          content: string;
          aspect_ratio?: string | null;
          duration?: string | null;
          attachment_path?: string | null;
          created_at?: string;
        };
        Update: {
          content?: string;
          aspect_ratio?: string | null;
          duration?: string | null;
          attachment_path?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      businesses: {
        Row: {
          id: string;
          user_id: string;
          company_url: string;
          company_name: string;
          logo_url: string | null;
          business_description: string | null;
          tagline: string | null;
          created_at: string;
          brand_colors: string[];
          tone_of_voice: string[];
          brand_values: string[];
          website_images: string[];
        };
        Insert: {
          id?: string;
          user_id: string;
          company_url: string;
          company_name: string;
          logo_url?: string | null;
          business_description?: string | null;
          tagline?: string | null;
          created_at?: string;
          brand_colors?: string[];
          tone_of_voice?: string[];
          brand_values?: string[];
          website_images?: string[];
        };
        Update: {
          user_id?: string;
          company_url?: string;
          company_name?: string;
          logo_url?: string | null;
          business_description?: string | null;
          tagline?: string | null;
          brand_colors?: string[];
          tone_of_voice?: string[];
          brand_values?: string[];
          website_images?: string[];
        };
        Relationships: [];
      };
      saved_projects: {
        Row: {
          id: string;
          user_id: string;
          project_name: string | null;
          product_type: number;
          image_url: string;
          thumbnail_url: string | null;
          generation_params: Json | null;
          created_at: string;
          updated_at: string;
          is_favorite: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          project_name?: string | null;
          product_type: number;
          image_url: string;
          thumbnail_url?: string | null;
          generation_params?: Json | null;
          created_at?: string;
          updated_at?: string;
          is_favorite?: boolean;
        };
        Update: {
          project_name?: string | null;
          generation_params?: Json | null;
          updated_at?: string;
          is_favorite?: boolean;
        };
        Relationships: [];
      };
      business_products: {
        Row: {
          id: string;
          business_id: string;
          user_id: string;
          product_name: string | null;
          product_tagline: string | null;
          product_description: string | null;
          category: string | null;
          pricing: Json | null;
          key_features: Json | null;
          benefits: Json | null;
          specifications: Json | null;
          use_cases: Json | null;
          materials: Json | null;
          product_images: Json | null;
          target_customer: string | null;
          source_url: string | null;
          created_at: string;
          updated_at: string;
          status: string | null;
          video_brief_generated: boolean | null;
          video_concept_1: Json | null;
          last_scraped_at: string | null;
          video_concept_2: Json | null;
          video_concept_3: Json | null;
        };
        Insert: {
          id?: string;
          business_id: string;
          user_id: string;
          product_name?: string | null;
          product_tagline?: string | null;
          product_description?: string | null;
          category?: string | null;
          pricing?: Json | null;
          key_features?: Json | null;
          benefits?: Json | null;
          specifications?: Json | null;
          use_cases?: Json | null;
          materials?: Json | null;
          product_images?: Json | null;
          target_customer?: string | null;
          source_url?: string | null;
          created_at?: string;
          updated_at?: string;
          status?: string | null;
          video_brief_generated?: boolean | null;
          video_concept_1?: Json | null;
          last_scraped_at?: string | null;
          video_concept_2?: Json | null;
          video_concept_3?: Json | null;
        };
        Update: {
          product_name?: string | null;
          product_tagline?: string | null;
          product_description?: string | null;
          category?: string | null;
          pricing?: Json | null;
          key_features?: Json | null;
          benefits?: Json | null;
          specifications?: Json | null;
          use_cases?: Json | null;
          materials?: Json | null;
          product_images?: Json | null;
          target_customer?: string | null;
          source_url?: string | null;
          updated_at?: string;
          status?: string | null;
          video_brief_generated?: boolean | null;
          video_concept_1?: Json | null;
          last_scraped_at?: string | null;
          video_concept_2?: Json | null;
          video_concept_3?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: "business_products_business_id_fkey";
            columns: ["business_id"];
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
}




