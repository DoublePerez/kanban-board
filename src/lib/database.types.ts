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
      profiles: {
        Row: {
          id: string;
          accent_color: string;
          user_initials: string;
          active_project_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          accent_color?: string;
          user_initials?: string;
          active_project_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          accent_color?: string;
          user_initials?: string;
          active_project_id?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          columns: Json;
          background_image_path: string | null;
          accent_color: string | null;
          position: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          columns?: Json;
          background_image_path?: string | null;
          accent_color?: string | null;
          position?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          columns?: Json;
          background_image_path?: string | null;
          accent_color?: string | null;
          position?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      tasks: {
        Row: {
          id: string;
          project_id: string;
          user_id: string;
          title: string;
          description: string;
          priority: string;
          date: string;
          due_date: string | null;
          column_id: string;
          subtasks: Json;
          position: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          user_id: string;
          title: string;
          description?: string;
          priority?: string;
          date: string;
          due_date?: string | null;
          column_id?: string;
          subtasks?: Json;
          position?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          user_id?: string;
          title?: string;
          description?: string;
          priority?: string;
          date?: string;
          due_date?: string | null;
          column_id?: string;
          subtasks?: Json;
          position?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      deleted_tasks: {
        Row: {
          id: string;
          user_id: string;
          original_project_id: string | null;
          task_snapshot: Json;
          deleted_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          original_project_id?: string | null;
          task_snapshot: Json;
          deleted_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          original_project_id?: string | null;
          task_snapshot?: Json;
          deleted_at?: string;
        };
        Relationships: [];
      };
      deleted_projects: {
        Row: {
          id: string;
          user_id: string;
          project_snapshot: Json;
          deleted_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          project_snapshot: Json;
          deleted_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          project_snapshot?: Json;
          deleted_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
