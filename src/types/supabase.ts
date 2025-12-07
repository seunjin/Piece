export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      ai_prompt_versions: {
        Row: {
          changelog: string | null;
          created_at: string | null;
          file_path: string | null;
          id: string;
          label: string | null;
          phase: string;
          prompt_text: string | null;
          version: string;
        };
        Insert: {
          changelog?: string | null;
          created_at?: string | null;
          file_path?: string | null;
          id?: string;
          label?: string | null;
          phase: string;
          prompt_text?: string | null;
          version: string;
        };
        Update: {
          changelog?: string | null;
          created_at?: string | null;
          file_path?: string | null;
          id?: string;
          label?: string | null;
          phase?: string;
          prompt_text?: string | null;
          version?: string;
        };
        Relationships: [];
      };
      ai_test_run_results: {
        Row: {
          cost_usd: number | null;
          created_at: string | null;
          id: string;
          input_payload: Json | null;
          input_tokens: number | null;
          model: string;
          output_payload: Json | null;
          output_tokens: number | null;
          phase: string;
          prompt_version_id: string | null;
          run_id: string | null;
        };
        Insert: {
          cost_usd?: number | null;
          created_at?: string | null;
          id?: string;
          input_payload?: Json | null;
          input_tokens?: number | null;
          model: string;
          output_payload?: Json | null;
          output_tokens?: number | null;
          phase: string;
          prompt_version_id?: string | null;
          run_id?: string | null;
        };
        Update: {
          cost_usd?: number | null;
          created_at?: string | null;
          id?: string;
          input_payload?: Json | null;
          input_tokens?: number | null;
          model?: string;
          output_payload?: Json | null;
          output_tokens?: number | null;
          phase?: string;
          prompt_version_id?: string | null;
          run_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "ai_test_run_results_prompt_version_id_fkey";
            columns: ["prompt_version_id"];
            isOneToOne: false;
            referencedRelation: "ai_prompt_versions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ai_test_run_results_run_id_fkey";
            columns: ["run_id"];
            isOneToOne: false;
            referencedRelation: "ai_test_runs";
            referencedColumns: ["id"];
          },
        ];
      };
      ai_test_runs: {
        Row: {
          created_at: string | null;
          finished_at: string | null;
          id: string;
          job_title: string | null;
          phase1_version_id: string | null;
          phase2_version_id: string | null;
          phase3_version_id: string | null;
          raw_input: string | null;
          sample_id: string | null;
          status: string;
          total_cost_usd: number | null;
          total_input_tokens: number | null;
          total_output_tokens: number | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          finished_at?: string | null;
          id?: string;
          job_title?: string | null;
          phase1_version_id?: string | null;
          phase2_version_id?: string | null;
          phase3_version_id?: string | null;
          raw_input?: string | null;
          sample_id?: string | null;
          status?: string;
          total_cost_usd?: number | null;
          total_input_tokens?: number | null;
          total_output_tokens?: number | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          finished_at?: string | null;
          id?: string;
          job_title?: string | null;
          phase1_version_id?: string | null;
          phase2_version_id?: string | null;
          phase3_version_id?: string | null;
          raw_input?: string | null;
          sample_id?: string | null;
          status?: string;
          total_cost_usd?: number | null;
          total_input_tokens?: number | null;
          total_output_tokens?: number | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "ai_test_runs_phase1_version_id_fkey";
            columns: ["phase1_version_id"];
            isOneToOne: false;
            referencedRelation: "ai_prompt_versions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ai_test_runs_phase2_version_id_fkey";
            columns: ["phase2_version_id"];
            isOneToOne: false;
            referencedRelation: "ai_prompt_versions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ai_test_runs_phase3_version_id_fkey";
            columns: ["phase3_version_id"];
            isOneToOne: false;
            referencedRelation: "ai_prompt_versions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ai_test_runs_sample_id_fkey";
            columns: ["sample_id"];
            isOneToOne: false;
            referencedRelation: "ai_test_samples";
            referencedColumns: ["id"];
          },
        ];
      };
      ai_test_samples: {
        Row: {
          created_at: string | null;
          description: string | null;
          id: string;
          job_title: string | null;
          raw_input: string;
          title: string;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          job_title?: string | null;
          raw_input: string;
          title: string;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          job_title?: string | null;
          raw_input?: string;
          title?: string;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          created_at: string;
          id: string;
          name: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const;
