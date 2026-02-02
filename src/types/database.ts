export type VerificationStatus = 'not_connected' | 'verifying' | 'connected';
export type MessageDirection = 'inbound' | 'outbound';
export type MessageSource = 'bot' | 'human';
export type OrderStatus = 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled';
export type BotType = 'restaurant' | 'salon' | 'ecommerce' | 'faq';

// Business types
export interface Business {
  id: string;
  user_id: string;
  name: string;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface BusinessInsert {
  user_id: string;
  name: string;
  timezone?: string;
}

export interface BusinessUpdate {
  name?: string;
  timezone?: string;
}

// WhatsApp types
export interface WhatsAppNumber {
  id: string;
  business_id: string;
  phone_number_id: string | null;
  business_account_id: string | null;
  display_phone_number: string | null;
  verification_status: VerificationStatus;
  access_token_encrypted: string | null;
  created_at: string;
  updated_at: string;
}

export interface WhatsAppNumberUpdate {
  phone_number_id?: string | null;
  business_account_id?: string | null;
  display_phone_number?: string | null;
  verification_status?: VerificationStatus;
  access_token_encrypted?: string | null;
}

// Bot types
export interface Bot {
  id: string;
  name: string;
  type: BotType;
  description: string | null;
  features: string[];
  icon: string | null;
  created_at: string;
}

export interface BotConfig {
  id: string;
  business_id: string;
  bot_id: string | null;
  greeting_message: string;
  static_replies: Array<{ question: string; answer: string }>;
  order_enabled: boolean;
  appointment_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface BotConfigUpdate {
  bot_id?: string | null;
  greeting_message?: string;
  static_replies?: Array<{ question: string; answer: string }>;
  order_enabled?: boolean;
  appointment_enabled?: boolean;
}

// Message types
export interface Message {
  id: string;
  business_id: string;
  from_number: string;
  to_number: string | null;
  message_text: string;
  direction: MessageDirection;
  source: MessageSource;
  whatsapp_message_id: string | null;
  created_at: string;
}

// Order types
export interface Order {
  id: string;
  business_id: string;
  customer_number: string;
  customer_name: string | null;
  details: Record<string, unknown>;
  total_amount: number | null;
  status: OrderStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderUpdate {
  status?: OrderStatus;
  notes?: string;
  customer_name?: string;
}

// Appointment types
export interface Appointment {
  id: string;
  business_id: string;
  customer_number: string;
  customer_name: string | null;
  service: string | null;
  scheduled_at: string;
  status: AppointmentStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AppointmentUpdate {
  status?: AppointmentStatus;
  scheduled_at?: string;
  notes?: string;
}

// AI Settings types
export interface AISettings {
  id: string;
  business_id: string;
  ai_enabled: boolean;
  gemini_api_key_encrypted: string | null;
  ai_model: string;
  system_prompt: string | null;
  created_at: string;
  updated_at: string;
}

export interface AISettingsUpdate {
  ai_enabled?: boolean;
  gemini_api_key_encrypted?: string | null;
  ai_model?: string;
  system_prompt?: string | null;
}
