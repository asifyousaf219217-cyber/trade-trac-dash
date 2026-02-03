import type { StepType, ValidationType } from '@/types/bot-config';

export interface TemplateDefinition {
  id: string;
  label: string;
  icon: string;
  industry: 'appointment' | 'order' | 'mixed';
  emojis: string[];
  
  // Bot Config (MUST update bot_configs table)
  greeting_message: string;
  fallback_message: string;
  unknown_message_help: string;
  appointment_enabled: boolean;
  order_enabled: boolean;
  
  // Structure
  menus: TemplateMenu[];
  booking_steps?: TemplateBookingStep[];
  
  // Preview
  preview_greeting: string;
}

export interface TemplateMenu {
  menu_name: string;
  message_text: string;
  is_entry_point: boolean;
  buttons: TemplateButton[];
}

export interface TemplateButton {
  button_order: number;
  button_label: string;
  button_id: string;
  action_type: string;
  links_to_menu?: string; // menu_name reference
}

export interface TemplateBookingStep {
  step_order: number;
  step_type: StepType;
  prompt_text: string;
  validation_type: ValidationType;
}

// ═══════════════════════════════════════════════════════════════
// 💇 SALON TEMPLATE (Appointment-based)
// ═══════════════════════════════════════════════════════════════
export const SALON_TEMPLATE: TemplateDefinition = {
  id: 'salon',
  label: 'Salon & Spa',
  icon: '💇',
  industry: 'appointment',
  emojis: ['💇', '💅', '✂️', '💆', '🧖'],
  
  greeting_message: "Welcome to our salon! 💇 How can we pamper you today?",
  fallback_message: "Thanks for reaching out! Our team will respond shortly. In the meantime, try tapping a button below.",
  unknown_message_help: "Not sure what to do? Try:\n• Tap '📅 Appointments' to book\n• Tap '❓ FAQ' for common questions\n• Tap '💬 Support' for help",
  
  appointment_enabled: true,
  order_enabled: false,
  
  preview_greeting: "Welcome to our salon! 💇 How can we pamper you today?",
  
  menus: [
    {
      menu_name: 'Main Menu',
      message_text: 'Hi there! 💇 How can I help you today?',
      is_entry_point: true,
      buttons: [
        { button_order: 1, button_label: '📅 Appointments', button_id: 'appointments', action_type: 'OPEN_MENU', links_to_menu: 'Appointments' },
        { button_order: 2, button_label: '❓ FAQ', button_id: 'faq', action_type: 'FAQ' },
        { button_order: 3, button_label: '💬 Support', button_id: 'human', action_type: 'HUMAN' },
      ]
    },
    {
      menu_name: 'Appointments',
      message_text: "Let's get you booked! What would you like to do?",
      is_entry_point: false,
      buttons: [
        { button_order: 1, button_label: '📅 Book Appointment', button_id: 'booking', action_type: 'START_BOOKING' },
        { button_order: 2, button_label: '❌ Cancel Appointment', button_id: 'cancel', action_type: 'CANCEL_APPOINTMENT' },
        { button_order: 3, button_label: '⬅ Back', button_id: 'back', action_type: 'OPEN_MENU', links_to_menu: 'Main Menu' },
      ]
    }
  ],
  
  booking_steps: [
    { step_order: 1, step_type: 'SERVICE', prompt_text: 'Which service would you like? (e.g., Haircut, Manicure, Facial)', validation_type: 'text' },
    { step_order: 2, step_type: 'DATETIME', prompt_text: 'What date and time work for you?', validation_type: 'datetime' },
    { step_order: 3, step_type: 'NAME', prompt_text: 'Great! What name should I book under?', validation_type: 'text' },
  ]
};

// ═══════════════════════════════════════════════════════════════
// 🍕 RESTAURANT TEMPLATE (Order-based)
// ═══════════════════════════════════════════════════════════════
export const RESTAURANT_TEMPLATE: TemplateDefinition = {
  id: 'restaurant',
  label: 'Restaurant & Food',
  icon: '🍕',
  industry: 'order',
  emojis: ['🍕', '🍔', '🍝', '🥗', '🍜'],
  
  greeting_message: "Welcome! 🍕 Ready to order something delicious?",
  fallback_message: "Thanks for your message! Our team will get back to you. Tap a button below to get started.",
  unknown_message_help: "Hungry? Here's what you can do:\n• Tap '🍽 View Menu' to see options\n• Tap '🛒 Order Now' to place an order\n• Tap '💬 Support' for help",
  
  appointment_enabled: false,
  order_enabled: true,
  
  preview_greeting: "Welcome! 🍕 Ready to order something delicious?",
  
  menus: [
    {
      menu_name: 'Main Menu',
      message_text: 'Hey! 🍕 Welcome to our restaurant! What can we do for you?',
      is_entry_point: true,
      buttons: [
        { button_order: 1, button_label: '🍽 View Menu', button_id: 'menu', action_type: 'FAQ' },
        { button_order: 2, button_label: '🛒 Order Now', button_id: 'order', action_type: 'OPEN_MENU', links_to_menu: 'Orders' },
        { button_order: 3, button_label: '💬 Support', button_id: 'human', action_type: 'HUMAN' },
      ]
    },
    {
      menu_name: 'Orders',
      message_text: "Ready to order? Here's what you can do:",
      is_entry_point: false,
      buttons: [
        { button_order: 1, button_label: '🛒 Place Order', button_id: 'start_order', action_type: 'START_ORDER' },
        { button_order: 2, button_label: '❌ Cancel Order', button_id: 'cancel', action_type: 'CANCEL_ORDER' },
        { button_order: 3, button_label: '⬅ Back', button_id: 'back', action_type: 'OPEN_MENU', links_to_menu: 'Main Menu' },
      ]
    }
  ],
  
  // NO booking_steps for restaurant - orders work differently
};

// ═══════════════════════════════════════════════════════════════
// 🏫 SCHOOL/CLASS TEMPLATE (Enrollment-based)
// ═══════════════════════════════════════════════════════════════
export const SCHOOL_TEMPLATE: TemplateDefinition = {
  id: 'school',
  label: 'School & Classes',
  icon: '📚',
  industry: 'appointment',
  emojis: ['📚', '🎓', '✏️', '📖', '🏫'],
  
  greeting_message: "Welcome to our learning center! 📚 Ready to start your journey?",
  fallback_message: "Thanks for reaching out! Our admissions team will respond soon.",
  unknown_message_help: "Need help? Try:\n• Tap '📚 Classes' to view options\n• Tap '📅 Schedule' to see times\n• Tap '💬 Support' for assistance",
  
  appointment_enabled: true,
  order_enabled: false,
  
  preview_greeting: "Welcome to our learning center! 📚 Ready to start your journey?",
  
  menus: [
    {
      menu_name: 'Main Menu',
      message_text: 'Hello! 📚 Welcome to our learning center!',
      is_entry_point: true,
      buttons: [
        { button_order: 1, button_label: '📚 Classes', button_id: 'classes', action_type: 'OPEN_MENU', links_to_menu: 'Enrollment' },
        { button_order: 2, button_label: '📅 Schedule', button_id: 'schedule', action_type: 'FAQ' },
        { button_order: 3, button_label: '💬 Support', button_id: 'human', action_type: 'HUMAN' },
      ]
    },
    {
      menu_name: 'Enrollment',
      message_text: 'Interested in our classes? Here are your options:',
      is_entry_point: false,
      buttons: [
        { button_order: 1, button_label: '✏️ Enroll Now', button_id: 'enroll', action_type: 'START_BOOKING' },
        { button_order: 2, button_label: '❌ Cancel', button_id: 'cancel', action_type: 'CANCEL_APPOINTMENT' },
        { button_order: 3, button_label: '⬅ Back', button_id: 'back', action_type: 'OPEN_MENU', links_to_menu: 'Main Menu' },
      ]
    }
  ],
  
  booking_steps: [
    { step_order: 1, step_type: 'CUSTOM', prompt_text: 'Which class would you like to enroll in?', validation_type: 'text' },
    { step_order: 2, step_type: 'DATETIME', prompt_text: 'Select your preferred schedule:', validation_type: 'datetime' },
    { step_order: 3, step_type: 'NAME', prompt_text: 'Student name:', validation_type: 'text' },
  ]
};

// ═══════════════════════════════════════════════════════════════
// 🏋️ GYM TEMPLATE
// ═══════════════════════════════════════════════════════════════
export const GYM_TEMPLATE: TemplateDefinition = {
  id: 'gym',
  label: 'Gym & Fitness',
  icon: '🏋️',
  industry: 'appointment',
  emojis: ['🏋️', '💪', '🏃', '🧘', '🥊'],
  
  greeting_message: "Welcome to our fitness center! 💪 Ready to crush your goals?",
  fallback_message: "Thanks for reaching out! Our team will respond shortly.",
  unknown_message_help: "Need help?\n• Tap '🏋️ Classes' to book a session\n• Tap '📋 Membership' for info\n• Tap '💬 Support' for assistance",
  
  appointment_enabled: true,
  order_enabled: false,
  
  preview_greeting: "Welcome to our fitness center! 💪 Ready to crush your goals?",
  
  menus: [
    {
      menu_name: 'Main Menu',
      message_text: 'Hey champ! 💪 What brings you here today?',
      is_entry_point: true,
      buttons: [
        { button_order: 1, button_label: '🏋️ Book Class', button_id: 'classes', action_type: 'OPEN_MENU', links_to_menu: 'Classes' },
        { button_order: 2, button_label: '📋 Membership', button_id: 'membership', action_type: 'FAQ' },
        { button_order: 3, button_label: '💬 Support', button_id: 'human', action_type: 'HUMAN' },
      ]
    },
    {
      menu_name: 'Classes',
      message_text: "Let's get you moving! What would you like to do?",
      is_entry_point: false,
      buttons: [
        { button_order: 1, button_label: '📅 Book Session', button_id: 'book', action_type: 'START_BOOKING' },
        { button_order: 2, button_label: '❌ Cancel', button_id: 'cancel', action_type: 'CANCEL_APPOINTMENT' },
        { button_order: 3, button_label: '⬅ Back', button_id: 'back', action_type: 'OPEN_MENU', links_to_menu: 'Main Menu' },
      ]
    }
  ],
  
  booking_steps: [
    { step_order: 1, step_type: 'SERVICE', prompt_text: 'Which class? (e.g., Yoga, Spin, CrossFit, Personal Training)', validation_type: 'text' },
    { step_order: 2, step_type: 'DATETIME', prompt_text: 'Preferred date and time?', validation_type: 'datetime' },
    { step_order: 3, step_type: 'NAME', prompt_text: 'Your name:', validation_type: 'text' },
  ]
};

// ═══════════════════════════════════════════════════════════════
// 🚗 AUTO SHOP TEMPLATE
// ═══════════════════════════════════════════════════════════════
export const AUTO_TEMPLATE: TemplateDefinition = {
  id: 'auto',
  label: 'Auto Shop',
  icon: '🚗',
  industry: 'appointment',
  emojis: ['🚗', '🔧', '🛠️', '⛽', '🚘'],
  
  greeting_message: "Welcome to our auto shop! 🚗 How can we help your vehicle today?",
  fallback_message: "Thanks for reaching out! Our mechanics will get back to you soon.",
  unknown_message_help: "Need help?\n• Tap '🔧 Services' to book\n• Tap '💰 Pricing' for estimates\n• Tap '💬 Support' for help",
  
  appointment_enabled: true,
  order_enabled: false,
  
  preview_greeting: "Welcome to our auto shop! 🚗 How can we help your vehicle today?",
  
  menus: [
    {
      menu_name: 'Main Menu',
      message_text: 'Hey! 🚗 What brings your ride in today?',
      is_entry_point: true,
      buttons: [
        { button_order: 1, button_label: '🔧 Services', button_id: 'services', action_type: 'OPEN_MENU', links_to_menu: 'Services' },
        { button_order: 2, button_label: '💰 Pricing', button_id: 'pricing', action_type: 'FAQ' },
        { button_order: 3, button_label: '💬 Support', button_id: 'human', action_type: 'HUMAN' },
      ]
    },
    {
      menu_name: 'Services',
      message_text: "Let's get your car sorted! What do you need?",
      is_entry_point: false,
      buttons: [
        { button_order: 1, button_label: '📅 Book Service', button_id: 'book', action_type: 'START_BOOKING' },
        { button_order: 2, button_label: '❌ Cancel', button_id: 'cancel', action_type: 'CANCEL_APPOINTMENT' },
        { button_order: 3, button_label: '⬅ Back', button_id: 'back', action_type: 'OPEN_MENU', links_to_menu: 'Main Menu' },
      ]
    }
  ],
  
  booking_steps: [
    { step_order: 1, step_type: 'SERVICE', prompt_text: 'What service? (e.g., Oil Change, Tire Rotation, Brake Check)', validation_type: 'text' },
    { step_order: 2, step_type: 'CUSTOM', prompt_text: 'Vehicle make/model?', validation_type: 'text' },
    { step_order: 3, step_type: 'DATETIME', prompt_text: 'Preferred drop-off date/time?', validation_type: 'datetime' },
    { step_order: 4, step_type: 'NAME', prompt_text: 'Your name:', validation_type: 'text' },
  ]
};

// ═══════════════════════════════════════════════════════════════
// TEMPLATE REGISTRY
// ═══════════════════════════════════════════════════════════════
export const TEMPLATE_REGISTRY: Record<string, TemplateDefinition> = {
  salon: SALON_TEMPLATE,
  restaurant: RESTAURANT_TEMPLATE,
  school: SCHOOL_TEMPLATE,
  gym: GYM_TEMPLATE,
  auto: AUTO_TEMPLATE,
};

export function getTemplateById(id: string): TemplateDefinition | undefined {
  return TEMPLATE_REGISTRY[id];
}

export function getAllTemplates(): TemplateDefinition[] {
  return Object.values(TEMPLATE_REGISTRY);
}

// Get template label for display
export function getTemplateLabel(id: string): string {
  const template = TEMPLATE_REGISTRY[id];
  return template ? `${template.icon} ${template.label}` : 'Custom Bot';
}
