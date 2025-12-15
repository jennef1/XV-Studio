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
          website_screenshot: string | null;
          target_audience: string | null;
          unique_selling_points: string[] | null;
          detached_at: string | null;
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
          website_screenshot?: string | null;
          target_audience?: string | null;
          unique_selling_points?: string[] | null;
          detached_at?: string | null;
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
          website_screenshot?: string | null;
          target_audience?: string | null;
          unique_selling_points?: string[] | null;
          detached_at?: string | null;
        };
        Relationships: [];
      };
      business_users: {
        Row: {
          id: string;
          business_id: string;
          user_id: string;
          role: string;
          joined_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          user_id: string;
          role?: string;
          joined_at?: string;
        };
        Update: {
          business_id?: string;
          user_id?: string;
          role?: string;
          joined_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "business_users_business_id_fkey";
            columns: ["business_id"];
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          }
        ];
      };
      saved_projects: {
        Row: {
          id: string;
          user_id: string;
          project_name: string | null;
          product_type: number;
          image_url: string;
          thumbnail_url: string | null;
          video_url: string | null;
          generation_params: Json | null;
          created_at: string;
          updated_at: string;
          is_favorite: boolean;
          campaign_job_id: string | null;
          workflow_type: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          project_name?: string | null;
          product_type: number;
          image_url: string;
          thumbnail_url?: string | null;
          video_url?: string | null;
          generation_params?: Json | null;
          created_at?: string;
          updated_at?: string;
          is_favorite?: boolean;
          campaign_job_id?: string | null;
          workflow_type?: string | null;
        };
        Update: {
          project_name?: string | null;
          generation_params?: Json | null;
          updated_at?: string;
          is_favorite?: boolean;
          video_url?: string | null;
          campaign_job_id?: string | null;
          workflow_type?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "saved_projects_campaign_job_id_fkey";
            columns: ["campaign_job_id"];
            referencedRelation: "campaign_generation_jobs";
            referencedColumns: ["id"];
          }
        ];
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
      campaign_generation_jobs: {
        Row: {
          id: string;
          user_id: string;
          business_id: string;
          product_id: string;
          job_type: "campaign_images" | "product_video" | "ai_explains_video" | "onboarding";
          status: "processing" | "completed" | "failed";
          request_data: Json;
          result_images: string[] | null;
          result_video_url: string | null;
          error_message: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          business_id: string;
          product_id: string;
          job_type?: "campaign_images" | "product_video" | "ai_explains_video" | "onboarding";
          status?: "processing" | "completed" | "failed";
          request_data: Json;
          result_images?: string[] | null;
          result_video_url?: string | null;
          error_message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          business_id?: string;
          product_id?: string;
          job_type?: "campaign_images" | "product_video" | "ai_explains_video" | "onboarding";
          status?: "processing" | "completed" | "failed";
          request_data?: Json;
          result_images?: string[] | null;
          result_video_url?: string | null;
          error_message?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      project_tracking: {
        Row: {
          id: string;
          saved_project_id: string;
          campaign_job_id: string | null;
          user_id: string;
          business_id: string | null;
          product_id: string | null;
          workflow_type: string;
          product_category: string | null;
          generation_count: number;
          edit_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          saved_project_id: string;
          campaign_job_id?: string | null;
          user_id: string;
          business_id?: string | null;
          product_id?: string | null;
          workflow_type: string;
          product_category?: string | null;
          generation_count?: number;
          edit_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          generation_count?: number;
          edit_count?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "project_tracking_saved_project_id_fkey";
            columns: ["saved_project_id"];
            referencedRelation: "saved_projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "project_tracking_campaign_job_id_fkey";
            columns: ["campaign_job_id"];
            referencedRelation: "campaign_generation_jobs";
            referencedColumns: ["id"];
          }
        ];
      };
      project_edit_history: {
        Row: {
          id: string;
          project_tracking_id: string;
          saved_project_id: string;
          edit_type: "generation" | "edit";
          edit_number: number;
          prompt: string;
          result_url: string;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_tracking_id: string;
          saved_project_id: string;
          edit_type: "generation" | "edit";
          edit_number: number;
          prompt: string;
          result_url: string;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          // History entries are immutable
        };
        Relationships: [
          {
            foreignKeyName: "project_edit_history_project_tracking_id_fkey";
            columns: ["project_tracking_id"];
            referencedRelation: "project_tracking";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "project_edit_history_saved_project_id_fkey";
            columns: ["saved_project_id"];
            referencedRelation: "saved_projects";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {};
    Functions: {
      increment_edit_count: {
        Args: {
          tracking_id: string;
        };
        Returns: void;
      };
    };
    Enums: {};
    CompositeTypes: {};
  };
}




