export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ai_settings: {
        Row: {
          ai_enabled: boolean | null
          ai_model: string | null
          business_id: string
          created_at: string
          gemini_api_key_encrypted: string | null
          id: string
          system_prompt: string | null
          updated_at: string
        }
        Insert: {
          ai_enabled?: boolean | null
          ai_model?: string | null
          business_id: string
          created_at?: string
          gemini_api_key_encrypted?: string | null
          id?: string
          system_prompt?: string | null
          updated_at?: string
        }
        Update: {
          ai_enabled?: boolean | null
          ai_model?: string | null
          business_id?: string
          created_at?: string
          gemini_api_key_encrypted?: string | null
          id?: string
          system_prompt?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_settings_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: true
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          business_id: string
          created_at: string
          customer_name: string | null
          customer_number: string
          id: string
          notes: string | null
          scheduled_at: string
          service: string | null
          status: Database["public"]["Enums"]["appointment_status"]
          updated_at: string
        }
        Insert: {
          business_id: string
          created_at?: string
          customer_name?: string | null
          customer_number: string
          id?: string
          notes?: string | null
          scheduled_at: string
          service?: string | null
          status?: Database["public"]["Enums"]["appointment_status"]
          updated_at?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          customer_name?: string | null
          customer_number?: string
          id?: string
          notes?: string | null
          scheduled_at?: string
          service?: string | null
          status?: Database["public"]["Enums"]["appointment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_steps: {
        Row: {
          business_id: string
          expected_values: Json | null
          id: string
          input_type: string | null
          is_enabled: boolean | null
          is_required: boolean | null
          list_items: Json | null
          list_source: string | null
          prompt_text: string
          retry_message: string | null
          skip_button_label: string | null
          step_order: number
          step_type: string
          validation_regex: string | null
          validation_type: string | null
        }
        Insert: {
          business_id: string
          expected_values?: Json | null
          id?: string
          input_type?: string | null
          is_enabled?: boolean | null
          is_required?: boolean | null
          list_items?: Json | null
          list_source?: string | null
          prompt_text: string
          retry_message?: string | null
          skip_button_label?: string | null
          step_order: number
          step_type: string
          validation_regex?: string | null
          validation_type?: string | null
        }
        Update: {
          business_id?: string
          expected_values?: Json | null
          id?: string
          input_type?: string | null
          is_enabled?: boolean | null
          is_required?: boolean | null
          list_items?: Json | null
          list_source?: string | null
          prompt_text?: string
          retry_message?: string | null
          skip_button_label?: string | null
          step_order?: number
          step_type?: string
          validation_regex?: string | null
          validation_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_steps_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      bot_configs: {
        Row: {
          active_template_id: string | null
          ai_api_key_encrypted: string | null
          ai_enabled: boolean | null
          ai_fallback: boolean | null
          appointment_enabled: boolean | null
          appointment_prompts: Json | null
          bot_id: string | null
          business_id: string
          cancellation_enabled: boolean | null
          created_at: string
          fallback_message: string | null
          faq_welcome_message: string | null
          greeting_message: string | null
          id: string
          is_active: boolean | null
          menuServices: string | null
          order_enabled: boolean | null
          order_prompts: Json | null
          selected_template: string | null
          static_replies: Json | null
          template_applied_at: string | null
          unknown_message_help: string | null
          updated_at: string
        }
        Insert: {
          active_template_id?: string | null
          ai_api_key_encrypted?: string | null
          ai_enabled?: boolean | null
          ai_fallback?: boolean | null
          appointment_enabled?: boolean | null
          appointment_prompts?: Json | null
          bot_id?: string | null
          business_id: string
          cancellation_enabled?: boolean | null
          created_at?: string
          fallback_message?: string | null
          faq_welcome_message?: string | null
          greeting_message?: string | null
          id?: string
          is_active?: boolean | null
          menuServices?: string | null
          order_enabled?: boolean | null
          order_prompts?: Json | null
          selected_template?: string | null
          static_replies?: Json | null
          template_applied_at?: string | null
          unknown_message_help?: string | null
          updated_at?: string
        }
        Update: {
          active_template_id?: string | null
          ai_api_key_encrypted?: string | null
          ai_enabled?: boolean | null
          ai_fallback?: boolean | null
          appointment_enabled?: boolean | null
          appointment_prompts?: Json | null
          bot_id?: string | null
          business_id?: string
          cancellation_enabled?: boolean | null
          created_at?: string
          fallback_message?: string | null
          faq_welcome_message?: string | null
          greeting_message?: string | null
          id?: string
          is_active?: boolean | null
          menuServices?: string | null
          order_enabled?: boolean | null
          order_prompts?: Json | null
          selected_template?: string | null
          static_replies?: Json | null
          template_applied_at?: string | null
          unknown_message_help?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bot_configs_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "bots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bot_configs_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: true
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      bots: {
        Row: {
          created_at: string
          description: string | null
          features: Json | null
          icon: string | null
          id: string
          name: string
          type: Database["public"]["Enums"]["bot_type"]
        }
        Insert: {
          created_at?: string
          description?: string | null
          features?: Json | null
          icon?: string | null
          id?: string
          name: string
          type: Database["public"]["Enums"]["bot_type"]
        }
        Update: {
          created_at?: string
          description?: string | null
          features?: Json | null
          icon?: string | null
          id?: string
          name?: string
          type?: Database["public"]["Enums"]["bot_type"]
        }
        Relationships: []
      }
      businesses: {
        Row: {
          created_at: string
          id: string
          name: string
          timezone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          timezone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          timezone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      conversation_logs: {
        Row: {
          bot_config_snapshot: Json | null
          business_id: string | null
          conversation_id: string | null
          conversation_state: string | null
          created_at: string | null
          customer_phone: string | null
          error_occurred: boolean | null
          id: string
          intent_matched: boolean | null
          intent_type: string | null
          message_text: string | null
        }
        Insert: {
          bot_config_snapshot?: Json | null
          business_id?: string | null
          conversation_id?: string | null
          conversation_state?: string | null
          created_at?: string | null
          customer_phone?: string | null
          error_occurred?: boolean | null
          id?: string
          intent_matched?: boolean | null
          intent_type?: string | null
          message_text?: string | null
        }
        Update: {
          bot_config_snapshot?: Json | null
          business_id?: string | null
          conversation_id?: string | null
          conversation_state?: string | null
          created_at?: string | null
          customer_phone?: string | null
          error_occurred?: boolean | null
          id?: string
          intent_matched?: boolean | null
          intent_type?: string | null
          message_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversation_logs_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_logs_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          ai_call_count: number | null
          bot_enabled: boolean | null
          business_id: string
          context: Json | null
          created_at: string | null
          customer_name: string | null
          customer_phone: string
          id: string
          last_bot_message_id: string | null
          last_message_at: string | null
          state: string
          status: string | null
        }
        Insert: {
          ai_call_count?: number | null
          bot_enabled?: boolean | null
          business_id: string
          context?: Json | null
          created_at?: string | null
          customer_name?: string | null
          customer_phone: string
          id?: string
          last_bot_message_id?: string | null
          last_message_at?: string | null
          state?: string
          status?: string | null
        }
        Update: {
          ai_call_count?: number | null
          bot_enabled?: boolean | null
          business_id?: string
          context?: Json | null
          created_at?: string | null
          customer_name?: string | null
          customer_phone?: string
          id?: string
          last_bot_message_id?: string | null
          last_message_at?: string | null
          state?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      interactive_menus: {
        Row: {
          business_id: string
          created_at: string
          id: string
          is_entry_point: boolean | null
          menu_name: string
          message_text: string
          updated_at: string
        }
        Insert: {
          business_id: string
          created_at?: string
          id?: string
          is_entry_point?: boolean | null
          menu_name: string
          message_text: string
          updated_at?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          id?: string
          is_entry_point?: boolean | null
          menu_name?: string
          message_text?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "interactive_menus_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_buttons: {
        Row: {
          action_type: string
          button_id: string
          button_label: string
          button_order: number
          id: string
          is_list_item: boolean | null
          list_section_title: string | null
          menu_id: string
          next_menu_id: string | null
        }
        Insert: {
          action_type: string
          button_id: string
          button_label: string
          button_order: number
          id?: string
          is_list_item?: boolean | null
          list_section_title?: string | null
          menu_id: string
          next_menu_id?: string | null
        }
        Update: {
          action_type?: string
          button_id?: string
          button_label?: string
          button_order?: number
          id?: string
          is_list_item?: boolean | null
          list_section_title?: string | null
          menu_id?: string
          next_menu_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_buttons_menu_id_fkey"
            columns: ["menu_id"]
            isOneToOne: false
            referencedRelation: "interactive_menus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_buttons_next_menu_id_fkey"
            columns: ["next_menu_id"]
            isOneToOne: false
            referencedRelation: "interactive_menus"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          business_id: string
          conversation_id: string | null
          created_at: string
          direction: Database["public"]["Enums"]["message_direction"]
          from_number: string
          id: string
          message_text: string
          metadata: Json | null
          source: Database["public"]["Enums"]["message_source"]
          to_number: string | null
          whatsapp_message_id: string | null
        }
        Insert: {
          business_id: string
          conversation_id?: string | null
          created_at?: string
          direction: Database["public"]["Enums"]["message_direction"]
          from_number: string
          id?: string
          message_text: string
          metadata?: Json | null
          source: Database["public"]["Enums"]["message_source"]
          to_number?: string | null
          whatsapp_message_id?: string | null
        }
        Update: {
          business_id?: string
          conversation_id?: string | null
          created_at?: string
          direction?: Database["public"]["Enums"]["message_direction"]
          from_number?: string
          id?: string
          message_text?: string
          metadata?: Json | null
          source?: Database["public"]["Enums"]["message_source"]
          to_number?: string | null
          whatsapp_message_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          business_id: string
          created_at: string
          customer_name: string | null
          customer_number: string
          details: Json | null
          id: string
          notes: string | null
          status: Database["public"]["Enums"]["order_status"]
          total_amount: number | null
          updated_at: string
        }
        Insert: {
          business_id: string
          created_at?: string
          customer_name?: string | null
          customer_number: string
          details?: Json | null
          id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          total_amount?: number | null
          updated_at?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          customer_name?: string | null
          customer_number?: string
          details?: Json | null
          id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          total_amount?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_numbers: {
        Row: {
          access_token_encrypted: string | null
          business_account_id: string | null
          business_id: string
          created_at: string
          display_phone_number: string | null
          id: string
          phone_number_id: string | null
          updated_at: string
          verification_status: Database["public"]["Enums"]["verification_status"]
        }
        Insert: {
          access_token_encrypted?: string | null
          business_account_id?: string | null
          business_id: string
          created_at?: string
          display_phone_number?: string | null
          id?: string
          phone_number_id?: string | null
          updated_at?: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
        }
        Update: {
          access_token_encrypted?: string | null
          business_account_id?: string | null
          business_id?: string
          created_at?: string
          display_phone_number?: string | null
          id?: string
          phone_number_id?: string | null
          updated_at?: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_numbers_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_sessions: {
        Row: {
          conversation_id: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          session_data: Json | null
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          session_data?: Json | null
        }
        Update: {
          conversation_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          session_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_sessions_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_bot_data_fast: {
        Args: {
          p_from_number: string
          p_phone_number_id: string
          p_whatsapp_message_id: string
        }
        Returns: Json
      }
      get_conversations_with_preview: {
        Args: { p_business_id: string; p_limit?: number }
        Returns: {
          bot_enabled: boolean
          customer_phone: string
          id: string
          last_message_at: string
          last_message_direction: string
          last_message_text: string
          status: string
          unread_count: number
        }[]
      }
      get_user_business_id:
        | { Args: never; Returns: string }
        | { Args: { _user_id: string }; Returns: string }
    }
    Enums: {
      appointment_status: "pending" | "confirmed" | "cancelled"
      bot_type: "restaurant" | "salon" | "ecommerce" | "faq"
      message_direction: "inbound" | "outbound"
      message_source: "bot" | "human"
      order_status:
        | "pending"
        | "accepted"
        | "rejected"
        | "completed"
        | "cancelled"
      step_input_type: "BUTTON" | "LIST" | "TEXT"
      verification_status: "not_connected" | "verifying" | "connected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      appointment_status: ["pending", "confirmed", "cancelled"],
      bot_type: ["restaurant", "salon", "ecommerce", "faq"],
      message_direction: ["inbound", "outbound"],
      message_source: ["bot", "human"],
      order_status: [
        "pending",
        "accepted",
        "rejected",
        "completed",
        "cancelled",
      ],
      step_input_type: ["BUTTON", "LIST", "TEXT"],
      verification_status: ["not_connected", "verifying", "connected"],
    },
  },
} as const
