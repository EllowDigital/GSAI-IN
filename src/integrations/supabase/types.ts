export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '12.2.3 (519615d)';
  };
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string | null;
          email: string;
          id: string;
        };
        Insert: {
          created_at?: string | null;
          email: string;
          id?: string;
        };
        Update: {
          created_at?: string | null;
          email?: string;
          id?: string;
        };
        Relationships: [];
      };
      audit_logs: {
        Row: {
          created_at: string | null;
          id: string;
          ip_address: unknown;
          new_values: Json | null;
          old_values: Json | null;
          operation: string;
          record_id: string | null;
          table_name: string;
          user_agent: string | null;
          user_email: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          ip_address?: unknown;
          new_values?: Json | null;
          old_values?: Json | null;
          operation: string;
          record_id?: string | null;
          table_name: string;
          user_agent?: string | null;
          user_email?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          ip_address?: unknown;
          new_values?: Json | null;
          old_values?: Json | null;
          operation?: string;
          record_id?: string | null;
          table_name?: string;
          user_agent?: string | null;
          user_email?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      belt_levels: {
        Row: {
          color: string;
          created_at: string;
          discipline: string | null;
          id: string;
          min_age: number | null;
          min_sessions: number | null;
          next_level_id: string | null;
          rank: number;
          requirements: Json;
          updated_at: string;
        };
        Insert: {
          color: string;
          created_at?: string;
          discipline?: string | null;
          id?: string;
          min_age?: number | null;
          min_sessions?: number | null;
          next_level_id?: string | null;
          rank: number;
          requirements?: Json;
          updated_at?: string;
        };
        Update: {
          color?: string;
          created_at?: string;
          discipline?: string | null;
          id?: string;
          min_age?: number | null;
          min_sessions?: number | null;
          next_level_id?: string | null;
          rank?: number;
          requirements?: Json;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'belt_levels_next_level_id_fkey';
            columns: ['next_level_id'];
            isOneToOne: false;
            referencedRelation: 'belt_levels';
            referencedColumns: ['id'];
          },
        ];
      };
      blogs: {
        Row: {
          content: string;
          created_at: string | null;
          created_by: string | null;
          description: string | null;
          id: string;
          image_url: string | null;
          published_at: string | null;
          title: string;
          updated_at: string | null;
        };
        Insert: {
          content: string;
          created_at?: string | null;
          created_by?: string | null;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          published_at?: string | null;
          title: string;
          updated_at?: string | null;
        };
        Update: {
          content?: string;
          created_at?: string | null;
          created_by?: string | null;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          published_at?: string | null;
          title?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      discipline_levels: {
        Row: {
          created_at: string;
          description: string | null;
          discipline: string;
          id: string;
          level_name: string;
          level_order: number;
          requirements: Json | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          discipline: string;
          id?: string;
          level_name: string;
          level_order?: number;
          requirements?: Json | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          discipline?: string;
          id?: string;
          level_name?: string;
          level_order?: number;
          requirements?: Json | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      events: {
        Row: {
          date: string;
          description: string | null;
          end_date: string | null;
          from_date: string | null;
          id: string;
          image_url: string | null;
          tag: string | null;
          title: string;
        };
        Insert: {
          date: string;
          description?: string | null;
          end_date?: string | null;
          from_date?: string | null;
          id?: string;
          image_url?: string | null;
          tag?: string | null;
          title: string;
        };
        Update: {
          date?: string;
          description?: string | null;
          end_date?: string | null;
          from_date?: string | null;
          id?: string;
          image_url?: string | null;
          tag?: string | null;
          title?: string;
        };
        Relationships: [];
      };
      fees: {
        Row: {
          balance_due: number;
          created_at: string | null;
          id: string;
          month: number;
          monthly_fee: number;
          notes: string | null;
          paid_amount: number;
          receipt_url: string | null;
          status: string | null;
          student_id: string;
          updated_at: string | null;
          year: number;
        };
        Insert: {
          balance_due?: number;
          created_at?: string | null;
          id?: string;
          month: number;
          monthly_fee: number;
          notes?: string | null;
          paid_amount?: number;
          receipt_url?: string | null;
          status?: string | null;
          student_id: string;
          updated_at?: string | null;
          year: number;
        };
        Update: {
          balance_due?: number;
          created_at?: string | null;
          id?: string;
          month?: number;
          monthly_fee?: number;
          notes?: string | null;
          paid_amount?: number;
          receipt_url?: string | null;
          status?: string | null;
          student_id?: string;
          updated_at?: string | null;
          year?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'fees_student_id_fkey';
            columns: ['student_id'];
            isOneToOne: false;
            referencedRelation: 'students';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'fees_student_id_fkey';
            columns: ['student_id'];
            isOneToOne: false;
            referencedRelation: 'students_masked';
            referencedColumns: ['id'];
          },
        ];
      };
      gallery_images: {
        Row: {
          caption: string | null;
          created_at: string | null;
          created_by: string | null;
          id: string;
          image_url: string;
          tag: string | null;
        };
        Insert: {
          caption?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          id?: string;
          image_url: string;
          tag?: string | null;
        };
        Update: {
          caption?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          id?: string;
          image_url?: string;
          tag?: string | null;
        };
        Relationships: [];
      };
      news: {
        Row: {
          created_at: string | null;
          created_by: string | null;
          date: string;
          id: string;
          image_url: string | null;
          short_description: string | null;
          status: string | null;
          title: string;
        };
        Insert: {
          created_at?: string | null;
          created_by?: string | null;
          date: string;
          id?: string;
          image_url?: string | null;
          short_description?: string | null;
          status?: string | null;
          title: string;
        };
        Update: {
          created_at?: string | null;
          created_by?: string | null;
          date?: string;
          id?: string;
          image_url?: string | null;
          short_description?: string | null;
          status?: string | null;
          title?: string;
        };
        Relationships: [];
      };
      promotion_history: {
        Row: {
          created_at: string;
          from_belt_id: string | null;
          id: string;
          notes: string | null;
          promoted_at: string;
          promoted_by: string | null;
          student_id: string;
          to_belt_id: string;
        };
        Insert: {
          created_at?: string;
          from_belt_id?: string | null;
          id?: string;
          notes?: string | null;
          promoted_at?: string;
          promoted_by?: string | null;
          student_id: string;
          to_belt_id: string;
        };
        Update: {
          created_at?: string;
          from_belt_id?: string | null;
          id?: string;
          notes?: string | null;
          promoted_at?: string;
          promoted_by?: string | null;
          student_id?: string;
          to_belt_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'promotion_history_from_belt_id_fkey';
            columns: ['from_belt_id'];
            isOneToOne: false;
            referencedRelation: 'belt_levels';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'promotion_history_student_id_fkey';
            columns: ['student_id'];
            isOneToOne: false;
            referencedRelation: 'students';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'promotion_history_student_id_fkey';
            columns: ['student_id'];
            isOneToOne: false;
            referencedRelation: 'students_masked';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'promotion_history_to_belt_id_fkey';
            columns: ['to_belt_id'];
            isOneToOne: false;
            referencedRelation: 'belt_levels';
            referencedColumns: ['id'];
          },
        ];
      };
      sensitive_data_audit: {
        Row: {
          accessed_at: string | null;
          action: string;
          details: Json | null;
          id: string;
          ip_address: string | null;
          record_id: string | null;
          table_name: string;
          user_email: string | null;
          user_id: string | null;
        };
        Insert: {
          accessed_at?: string | null;
          action: string;
          details?: Json | null;
          id?: string;
          ip_address?: string | null;
          record_id?: string | null;
          table_name: string;
          user_email?: string | null;
          user_id?: string | null;
        };
        Update: {
          accessed_at?: string | null;
          action?: string;
          details?: Json | null;
          id?: string;
          ip_address?: string | null;
          record_id?: string | null;
          table_name?: string;
          user_email?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      student_discipline_progress: {
        Row: {
          coach_notes: string | null;
          completed_at: string | null;
          created_at: string;
          discipline_level_id: string;
          id: string;
          milestones: Json | null;
          started_at: string;
          status: string;
          student_id: string;
          updated_at: string;
        };
        Insert: {
          coach_notes?: string | null;
          completed_at?: string | null;
          created_at?: string;
          discipline_level_id: string;
          id?: string;
          milestones?: Json | null;
          started_at?: string;
          status?: string;
          student_id: string;
          updated_at?: string;
        };
        Update: {
          coach_notes?: string | null;
          completed_at?: string | null;
          created_at?: string;
          discipline_level_id?: string;
          id?: string;
          milestones?: Json | null;
          started_at?: string;
          status?: string;
          student_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'student_discipline_progress_discipline_level_id_fkey';
            columns: ['discipline_level_id'];
            isOneToOne: false;
            referencedRelation: 'discipline_levels';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'student_discipline_progress_student_id_fkey';
            columns: ['student_id'];
            isOneToOne: false;
            referencedRelation: 'students';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'student_discipline_progress_student_id_fkey';
            columns: ['student_id'];
            isOneToOne: false;
            referencedRelation: 'students_masked';
            referencedColumns: ['id'];
          },
        ];
      };
      student_progress: {
        Row: {
          assessed_by: string | null;
          assessment_date: string | null;
          belt_level_id: string;
          coach_notes: string | null;
          created_at: string;
          evidence_media_urls: string[];
          id: string;
          status: string;
          stripe_count: number | null;
          student_id: string;
          updated_at: string;
        };
        Insert: {
          assessed_by?: string | null;
          assessment_date?: string | null;
          belt_level_id: string;
          coach_notes?: string | null;
          created_at?: string;
          evidence_media_urls?: string[];
          id?: string;
          status?: string;
          stripe_count?: number | null;
          student_id: string;
          updated_at?: string;
        };
        Update: {
          assessed_by?: string | null;
          assessment_date?: string | null;
          belt_level_id?: string;
          coach_notes?: string | null;
          created_at?: string;
          evidence_media_urls?: string[];
          id?: string;
          status?: string;
          stripe_count?: number | null;
          student_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'student_progress_belt_level_id_fkey';
            columns: ['belt_level_id'];
            isOneToOne: false;
            referencedRelation: 'belt_levels';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'student_progress_student_id_fkey';
            columns: ['student_id'];
            isOneToOne: false;
            referencedRelation: 'students';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'student_progress_student_id_fkey';
            columns: ['student_id'];
            isOneToOne: false;
            referencedRelation: 'students_masked';
            referencedColumns: ['id'];
          },
        ];
      };
      students: {
        Row: {
          aadhar_number: string;
          created_at: string | null;
          created_by: string | null;
          default_monthly_fee: number;
          encrypted_aadhar_number: string | null;
          fee_status: string | null;
          id: string;
          join_date: string;
          name: string;
          parent_contact: string;
          parent_name: string;
          profile_image_url: string | null;
          program: string;
        };
        Insert: {
          aadhar_number: string;
          created_at?: string | null;
          created_by?: string | null;
          default_monthly_fee?: number;
          encrypted_aadhar_number?: string | null;
          fee_status?: string | null;
          id?: string;
          join_date: string;
          name: string;
          parent_contact: string;
          parent_name: string;
          profile_image_url?: string | null;
          program: string;
        };
        Update: {
          aadhar_number?: string;
          created_at?: string | null;
          created_by?: string | null;
          default_monthly_fee?: number;
          encrypted_aadhar_number?: string | null;
          fee_status?: string | null;
          id?: string;
          join_date?: string;
          name?: string;
          parent_contact?: string;
          parent_name?: string;
          profile_image_url?: string | null;
          program?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string | null;
          id: string;
          role: Database['public']['Enums']['app_role'];
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          role: Database['public']['Enums']['app_role'];
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          role?: Database['public']['Enums']['app_role'];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      students_masked: {
        Row: {
          aadhar_number_full: string | null;
          aadhar_number_masked: string | null;
          created_at: string | null;
          created_by: string | null;
          default_monthly_fee: number | null;
          encrypted_aadhar_number: string | null;
          fee_status: string | null;
          id: string | null;
          join_date: string | null;
          name: string | null;
          parent_contact_full: string | null;
          parent_contact_masked: string | null;
          parent_name: string | null;
          profile_image_url: string | null;
          program: string | null;
        };
        Insert: {
          aadhar_number_full?: string | null;
          aadhar_number_masked?: never;
          created_at?: string | null;
          created_by?: string | null;
          default_monthly_fee?: number | null;
          encrypted_aadhar_number?: string | null;
          fee_status?: string | null;
          id?: string | null;
          join_date?: string | null;
          name?: string | null;
          parent_contact_full?: string | null;
          parent_contact_masked?: never;
          parent_name?: string | null;
          profile_image_url?: string | null;
          program?: string | null;
        };
        Update: {
          aadhar_number_full?: string | null;
          aadhar_number_masked?: never;
          created_at?: string | null;
          created_by?: string | null;
          default_monthly_fee?: number | null;
          encrypted_aadhar_number?: string | null;
          fee_status?: string | null;
          id?: string | null;
          join_date?: string | null;
          name?: string | null;
          parent_contact_full?: string | null;
          parent_contact_masked?: never;
          parent_name?: string | null;
          profile_image_url?: string | null;
          program?: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      decrypt_sensitive_data: {
        Args: { encrypted_data: string };
        Returns: string;
      };
      encrypt_sensitive_data: { Args: { data_text: string }; Returns: string };
      has_role:
        | {
            Args: {
              _role: Database['public']['Enums']['app_role'];
              _user_id: string;
            };
            Returns: boolean;
          }
        | { Args: { required_role: string }; Returns: boolean };
      is_progress_status_unchanged: {
        Args: { new_status: string; row_id: string };
        Returns: boolean;
      };
      log_sensitive_data_access: {
        Args: { p_action?: string; p_record_id: string; p_table_name: string };
        Returns: undefined;
      };
      mask_aadhar: { Args: { aadhar_number: string }; Returns: string };
      mask_phone: { Args: { phone_number: string }; Returns: string };
      validate_aadhar: { Args: { aadhar_text: string }; Returns: boolean };
      validate_phone: { Args: { phone_text: string }; Returns: boolean };
    };
    Enums: {
      app_role:
        | 'super_admin'
        | 'finance_admin'
        | 'content_admin'
        | 'instructor'
        | 'student'
        | 'admin'
        | 'staff';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  'public'
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: [
        'super_admin',
        'finance_admin',
        'content_admin',
        'instructor',
        'student',
        'admin',
        'staff',
      ],
    },
  },
} as const;
