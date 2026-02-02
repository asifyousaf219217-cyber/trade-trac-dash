export interface FAQ {
  id: string;
  question: string;
  answer: string;
  keywords: string[];
}

export interface StaticReply {
  keywords: string[];
  reply: string;
}

export interface AppointmentPrompts {
  service_prompt?: string;
  datetime_prompt?: string;
  name_prompt?: string;
  confirmation_template?: string;
  cancel_message?: string;
}

export interface OrderPrompts {
  start_prompt?: string;
  item_added_template?: string;
  empty_order_message?: string;
  confirmation_template?: string;
  cancel_message?: string;
}

// Interactive Menu Types
export interface InteractiveMenu {
  id: string;
  business_id: string;
  menu_name: string;
  message_text: string;
  is_entry_point: boolean;
  buttons?: MenuButton[];
  created_at: string;
  updated_at: string;
}

export interface MenuButton {
  id: string;
  menu_id: string;
  button_order: number; // 1, 2, or 3
  button_label: string; // Max 20 chars
  button_id: string;
  action_type: ActionType;
  next_menu_id?: string | null;
}

export type ActionType = 
  | 'OPEN_MENU'
  | 'START_BOOKING'
  | 'START_ORDER'
  | 'FAQ'
  | 'HUMAN'
  | 'CANCEL_APPOINTMENT'
  | 'CANCEL_ORDER'
  | 'CUSTOM';

// Booking Step Types
export interface BookingStep {
  id: string;
  business_id: string;
  step_order: number;
  step_type: StepType;
  prompt_text: string;
  validation_type?: ValidationType | null;
  is_required: boolean;
  is_enabled: boolean;
}

export type StepType = 
  | 'SERVICE'
  | 'DATETIME'
  | 'NAME'
  | 'PHONE'
  | 'EMAIL'
  | 'CUSTOM';

export type ValidationType =
  | 'text'
  | 'datetime'
  | 'phone'
  | 'email'
  | 'service_match';

export type TemplateType = 'appointment' | 'order' | 'class_booking';

export interface BotTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  greeting: string;
  workingHours: string;
  menuServices: string;
  faqs: FAQ[];
  fallbackMessage: string;
}

export interface BotConfigFormData {
  greeting: string;
  businessName: string;
  businessDescription: string;
  workingHours: string;
  menuServices: string;
  faqs: FAQ[];
  isActive: boolean;
  fallbackMessage: string;
  unknownMessageHelp: string;
  aiFallback: boolean;
  appointmentEnabled: boolean;
  appointmentPrompts: AppointmentPrompts;
  orderEnabled: boolean;
  orderPrompts: OrderPrompts;
  selectedTemplate: TemplateType;
  aiEnabled: boolean;
  aiApiKey?: string;
  cancellationEnabled: boolean;
}

// Stop words to filter out from keyword extraction
export const STOP_WORDS = [
  'what', 'when', 'where', 'how', 'why', 'who', 'which',
  'are', 'is', 'do', 'does', 'can', 'could', 'would', 'should',
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'you', 'your', 'my', 'i', 'we', 'our', 'they', 'their',
  'this', 'that', 'these', 'those', 'have', 'has', 'had',
  'will', 'about', 'with', 'from', 'any', 'some'
];

// Keywords for working hours detection
export const WORKING_HOURS_KEYWORDS = ['hours', 'open', 'time', 'when', 'schedule', 'available', 'close', 'closed'];

// Keywords for menu/services detection
export const MENU_SERVICES_KEYWORDS = ['menu', 'services', 'price', 'cost', 'pricing', 'list', 'offer', 'rate', 'rates'];

/**
 * Extract keywords from a question, filtering out common stop words
 */
export function extractKeywordsFromQuestion(question: string): string[] {
  return question
    .toLowerCase()
    .replace(/[?.,!'"]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2 && !STOP_WORDS.includes(word))
    .slice(0, 5);
}

/**
 * Generate a unique FAQ ID
 */
export function generateFAQId(): string {
  return `faq-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Action type labels for UI display
 */
export const ACTION_TYPE_LABELS: Record<ActionType, string> = {
  'OPEN_MENU': 'Open Menu',
  'START_BOOKING': 'Start Booking',
  'START_ORDER': 'Start Order',
  'FAQ': 'Show FAQ',
  'HUMAN': 'Human Support',
  'CANCEL_APPOINTMENT': 'Cancel Appointment',
  'CANCEL_ORDER': 'Cancel Order',
  'CUSTOM': 'Custom Action',
};

/**
 * Step type labels for UI display
 */
export const STEP_TYPE_LABELS: Record<StepType, string> = {
  'SERVICE': 'Service Selection',
  'DATETIME': 'Date & Time',
  'NAME': 'Customer Name',
  'PHONE': 'Phone Number',
  'EMAIL': 'Email Address',
  'CUSTOM': 'Custom Field',
};

/**
 * Validation type labels for UI display
 */
export const VALIDATION_TYPE_LABELS: Record<ValidationType, string> = {
  'text': 'Text',
  'datetime': 'Date/Time',
  'phone': 'Phone Number',
  'email': 'Email Address',
  'service_match': 'Service Match',
};
