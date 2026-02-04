import type { StepType, ValidationType } from '@/types/bot-config';

export interface StaticReplyDef {
  keywords: string[];
  reply: string;
}

export interface ServiceDef {
  name: string;
  price?: string;
  description?: string;
}

export type StepInputType = 'BUTTON' | 'LIST' | 'TEXT';

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
  
  // FAQs / Static Replies (CRITICAL for proper template isolation)
  static_replies: StaticReplyDef[];
  
  // Services list (for display)
  services: ServiceDef[];
  
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
  // NEW: Interactive input fields
  input_type: StepInputType;
  expected_values?: string[];
  validation_regex?: string;
  retry_message?: string;
  is_required?: boolean;
  skip_button_label?: string;
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
  fallback_message: "Thanks for reaching out! Our stylists will respond shortly. Try tapping a button below.",
  unknown_message_help: "Not sure what to do? Try:\n• Tap '📅 Appointments' to book\n• Tap '❓ FAQ' for common questions\n• Tap '💬 Support' for help",
  
  appointment_enabled: true,
  order_enabled: false,
  
  static_replies: [
    { keywords: ['hours', 'open', 'close', 'time', 'schedule'], reply: "💇 Our Hours:\nMon-Sat: 9AM - 7PM\nSunday: 10AM - 5PM\n\nBook anytime via the menu!" },
    { keywords: ['price', 'cost', 'menu', 'services', 'list', 'rate'], reply: "💅 Our Services:\n• Haircut - $35\n• Manicure - $25\n• Pedicure - $30\n• Facial - $60\n• Massage - $80\n\nTap 📅 to book!" },
    { keywords: ['location', 'address', 'where', 'find'], reply: "📍 We're located at 123 Beauty Lane, Suite 100.\n\nParking available in back!" },
    { keywords: ['cancel', 'reschedule', 'change'], reply: "To cancel or reschedule, tap the menu button and select 'Cancel Appointment'." },
  ],
  
  services: [
    { name: 'Haircut', price: '$35' },
    { name: 'Manicure', price: '$25' },
    { name: 'Pedicure', price: '$30' },
    { name: 'Facial', price: '$60' },
    { name: 'Massage', price: '$80' },
  ],
  
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
        { button_order: 1, button_label: '📅 Book Now', button_id: 'booking', action_type: 'START_BOOKING' },
        { button_order: 2, button_label: '❌ Cancel', button_id: 'cancel', action_type: 'CANCEL_APPOINTMENT' },
        { button_order: 3, button_label: '⬅ Back', button_id: 'back', action_type: 'OPEN_MENU', links_to_menu: 'Main Menu' },
      ]
    }
  ],
  
  booking_steps: [
    { 
      step_order: 1, 
      step_type: 'SERVICE', 
      prompt_text: 'Which service would you like?',
      validation_type: 'text',
      input_type: 'LIST',
      expected_values: ['Haircut', 'Manicure', 'Pedicure', 'Facial', 'Massage'],
      retry_message: 'Please select a service from the list above 👆'
    },
    { 
      step_order: 2, 
      step_type: 'DATETIME', 
      prompt_text: 'What date and time work for you?',
      validation_type: 'datetime',
      input_type: 'TEXT',
      validation_regex: '(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday|\\d)',
      retry_message: '❌ Please enter a valid date/time.\n\nExamples:\n• Tomorrow 3pm\n• Monday at 10am'
    },
    { 
      step_order: 3, 
      step_type: 'NAME', 
      prompt_text: 'Your name:',
      validation_type: 'text',
      input_type: 'TEXT',
      validation_regex: '^[a-zA-Z\\s\\-\']{2,}$',
      retry_message: '❌ Please enter a valid name (letters only).'
    },
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
  
  static_replies: [
    { keywords: ['hours', 'open', 'close', 'time'], reply: "🍕 We're open:\nDaily: 11AM - 10PM\nDelivery until 9:30PM\n\nTap 🛒 to order!" },
    { keywords: ['menu', 'food', 'eat', 'price', 'cost', 'list'], reply: "🍕 Our Menu:\n• Margherita Pizza - $12\n• Pepperoni Pizza - $14\n• Pasta Carbonara - $15\n• Caesar Salad - $10\n• Garlic Bread - $6\n\nTap 🛒 to order!" },
    { keywords: ['delivery', 'deliver', 'area'], reply: "🚗 Yes, we deliver!\n• Within 5 miles\n• Free delivery on orders over $30\n• Usually 30-45 minutes" },
    { keywords: ['location', 'address', 'where'], reply: "📍 We're at 456 Food Street.\nDine-in, takeout, or delivery available!" },
  ],
  
  services: [
    { name: 'Margherita Pizza', price: '$12' },
    { name: 'Pepperoni Pizza', price: '$14' },
    { name: 'Pasta Carbonara', price: '$15' },
    { name: 'Caesar Salad', price: '$10' },
    { name: 'Garlic Bread', price: '$6' },
  ],
  
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
  
  greeting_message: "Welcome to our learning center! 📚 How can we help you today?",
  fallback_message: "Thanks for reaching out! Our admissions team will respond soon.",
  unknown_message_help: "Need help? Try:\n• Tap '📚 Classes' to view our programs\n• Tap '📅 Schedule' to see times\n• Tap '💬 Support' for assistance",
  
  appointment_enabled: true,
  order_enabled: false,
  
  static_replies: [
    { keywords: ['hours', 'open', 'schedule', 'time'], reply: "🏫 School Hours:\nMon-Fri: 8AM - 4PM\nOffice: 7:30AM - 5PM\n\nClasses run throughout the day!" },
    { keywords: ['classes', 'courses', 'programs', 'list'], reply: "📚 Our Programs:\n• Math Tutoring - $50/hr\n• English Language - $45/hr\n• Science Lab - $60/session\n• Music Lessons - $55/hr\n• Art Classes - $40/hr\n\nTap ✏️ Enroll to register!" },
    { keywords: ['fee', 'cost', 'price', 'tuition', 'payment'], reply: "💰 Fees vary by program:\n• Tutoring: $45-60/hr\n• Group classes: $30-40/session\n• Monthly packages available!\n\nContact admissions for details." },
    { keywords: ['location', 'address', 'where', 'find'], reply: "📍 We're at 456 Education Drive.\nFree parking available for students and parents!" },
    { keywords: ['age', 'grade', 'level'], reply: "👨‍🎓 We accept students:\n• Elementary (K-5)\n• Middle School (6-8)\n• High School (9-12)\n• Adult learners welcome!" },
  ],
  
  services: [
    { name: 'Math Tutoring', price: '$50/hr' },
    { name: 'English Language', price: '$45/hr' },
    { name: 'Science Lab', price: '$60/session' },
    { name: 'Music Lessons', price: '$55/hr' },
    { name: 'Art Classes', price: '$40/hr' },
  ],
  
  preview_greeting: "Welcome to our learning center! 📚 How can we help you today?",
  
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
    { 
      step_order: 1, 
      step_type: 'CUSTOM', 
      prompt_text: 'Which class would you like to enroll in?',
      validation_type: 'text',
      input_type: 'LIST',
      expected_values: ['Math Tutoring', 'English Language', 'Science Lab', 'Music Lessons', 'Art Classes'],
      retry_message: 'Please select a class from the list above 👆'
    },
    { 
      step_order: 2, 
      step_type: 'CUSTOM', 
      prompt_text: 'Student name and grade level:',
      validation_type: 'text',
      input_type: 'TEXT',
      validation_regex: '.{3,}',
      retry_message: 'Please enter the student name and grade (e.g., "John - Grade 5")'
    },
    { 
      step_order: 3, 
      step_type: 'DATETIME', 
      prompt_text: 'Preferred schedule:',
      validation_type: 'datetime',
      input_type: 'TEXT',
      validation_regex: '(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday|\\d)',
      retry_message: '❌ Please enter a valid schedule.\n\nExamples:\n• Monday 4pm\n• Weekends morning'
    },
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
  
  static_replies: [
    { keywords: ['hours', 'open', 'close', 'time'], reply: "🏋️ Gym Hours:\nOpen 24/7!\nStaffed: 6AM - 10PM\n\nSwipe in anytime with your card." },
    { keywords: ['membership', 'price', 'cost', 'fee', 'join'], reply: "💪 Memberships:\n• Monthly - $49/mo\n• Annual - $499/yr (save $89!)\n• Day Pass - $15\n• Student - $35/mo\n\nNo signup fees this month!" },
    { keywords: ['classes', 'schedule', 'class', 'session'], reply: "🧘 Our Classes:\n• Yoga - Daily 7AM & 6PM\n• Spin - Mon/Wed/Fri 5:30PM\n• CrossFit - Tue/Thu 6PM\n• Boxing - Sat 10AM\n• HIIT - Daily 12PM\n\nTap 📅 to book!" },
    { keywords: ['location', 'address', 'where', 'find'], reply: "📍 We're at 789 Fitness Blvd.\nFree parking, locker rooms, and showers available!" },
    { keywords: ['trainer', 'personal', 'pt'], reply: "💪 Personal Training:\n• 1 Session - $60\n• 5 Pack - $275 (save $25)\n• 10 Pack - $500 (save $100)\n\nFirst session FREE for new members!" },
  ],
  
  services: [
    { name: 'Yoga Class', price: '$15/class' },
    { name: 'Spin Class', price: '$15/class' },
    { name: 'CrossFit', price: '$20/class' },
    { name: 'Boxing', price: '$20/class' },
    { name: 'Personal Training', price: '$60/hr' },
  ],
  
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
    { 
      step_order: 1, 
      step_type: 'SERVICE', 
      prompt_text: 'Which class would you like to book?',
      validation_type: 'text',
      input_type: 'LIST',
      expected_values: ['Yoga Class', 'Spin Class', 'CrossFit', 'Boxing', 'HIIT', 'Personal Training'],
      retry_message: 'Please select a class from the list above 👆'
    },
    { 
      step_order: 2, 
      step_type: 'DATETIME', 
      prompt_text: 'Preferred date and time?',
      validation_type: 'datetime',
      input_type: 'TEXT',
      validation_regex: '(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday|\\d)',
      retry_message: '❌ Please enter a valid date/time.\n\nExamples:\n• Tomorrow 6pm\n• Saturday 10am'
    },
    { 
      step_order: 3, 
      step_type: 'NAME', 
      prompt_text: 'Your name:',
      validation_type: 'text',
      input_type: 'TEXT',
      validation_regex: '^[a-zA-Z\\s\\-\']{2,}$',
      retry_message: '❌ Please enter a valid name (letters only).'
    },
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
  unknown_message_help: "Need help?\n• Tap '🔧 Services' to book a service\n• Tap '💰 Pricing' for estimates\n• Tap '💬 Support' for help",
  
  appointment_enabled: true,
  order_enabled: false,
  
  static_replies: [
    { keywords: ['hours', 'open', 'close', 'time'], reply: "🔧 Shop Hours:\nMon-Fri: 7AM - 6PM\nSaturday: 8AM - 4PM\nSunday: Closed\n\nDrop-offs accepted before hours!" },
    { keywords: ['price', 'cost', 'services', 'list', 'menu'], reply: "🔧 Our Services:\n• Oil Change - $45\n• Tire Rotation - $35\n• Brake Check - $50 (free w/ repair)\n• Full Inspection - $99\n• AC Service - $89\n• Transmission - Quote\n\nTap 📅 to book!" },
    { keywords: ['location', 'address', 'where', 'find'], reply: "📍 We're at 321 Auto Lane.\nDrop-off area in front, waiting room with WiFi & coffee!" },
    { keywords: ['tow', 'emergency', 'breakdown'], reply: "🚨 Need a tow?\nCall our 24/7 line: (555) 123-4567\nWe'll get you sorted!" },
    { keywords: ['warranty', 'guarantee'], reply: "✅ All work guaranteed!\n• Parts: Manufacturer warranty\n• Labor: 90-day guarantee\n• Satisfaction guaranteed or we'll make it right!" },
  ],
  
  services: [
    { name: 'Oil Change', price: '$45' },
    { name: 'Tire Rotation', price: '$35' },
    { name: 'Brake Check', price: '$50' },
    { name: 'Full Inspection', price: '$99' },
    { name: 'AC Service', price: '$89' },
  ],
  
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
    { 
      step_order: 1, 
      step_type: 'SERVICE', 
      prompt_text: 'What service do you need?',
      validation_type: 'text',
      input_type: 'LIST',
      expected_values: ['Oil Change', 'Tire Rotation', 'Brake Check', 'Full Inspection', 'AC Service', 'Other'],
      retry_message: 'Please select a service from the list above 👆'
    },
    { 
      step_order: 2, 
      step_type: 'CUSTOM', 
      prompt_text: 'Vehicle make, model, and year?',
      validation_type: 'text',
      input_type: 'TEXT',
      validation_regex: '.{5,}',
      retry_message: 'Please enter your vehicle info (e.g., "2020 Toyota Camry")'
    },
    { 
      step_order: 3, 
      step_type: 'DATETIME', 
      prompt_text: 'Preferred drop-off date and time?',
      validation_type: 'datetime',
      input_type: 'TEXT',
      validation_regex: '(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|\\d)',
      retry_message: '❌ Please enter a valid date/time.\n\nExamples:\n• Tomorrow 8am\n• Monday morning'
    },
    { 
      step_order: 4, 
      step_type: 'NAME', 
      prompt_text: 'Your name and phone number:',
      validation_type: 'text',
      input_type: 'TEXT',
      validation_regex: '.{5,}',
      retry_message: 'Please enter your name and phone number.'
    },
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
export function getTemplateLabel(id: string | null | undefined): string {
  if (!id) return 'Custom Bot';
  const template = TEMPLATE_REGISTRY[id];
  return template ? `${template.icon} ${template.label}` : 'Custom Bot';
}
