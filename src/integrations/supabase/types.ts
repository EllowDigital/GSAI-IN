export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instanciate createClient with right options
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
      students: {
        Row: {
          aadhar_number: string;
          created_at: string | null;
          created_by: string | null;
          default_monthly_fee: number;
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
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
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
    Enums: {},
  },
} as const;
