// Conversation states for the chat flow
export type ConversationState =
  | 'NEW'
  | 'AWAITING_INTENT'
  | 'BOOKING_SERVICE'
  | 'BOOKING_DATE'
  | 'BOOKING_NAME'
  | 'BOOKING_CONFIRM'
  | 'ORDERING_ITEMS'
  | 'FAQ'
  | 'HUMAN_REVIEW';

export interface InteractiveButton {
  id: string;
  title: string;
}

export interface MessageMetadata {
  reply_type?: 'text' | 'interactive';
  interactive_buttons?: InteractiveButton[];
}

export interface ChatMessageData {
  id: string;
  conversation_id: string;
  from_number: string;
  to_number?: string | null;
  message_text: string;
  direction: 'inbound' | 'outbound';
  source: 'bot' | 'human';
  metadata?: MessageMetadata | null;
  created_at: string;
}

export interface ConversationData {
  id: string;
  customerPhone: string;
  customerName?: string;
  lastMessage: string;
  lastMessageTime: string;
  lastMessageDirection: 'inbound' | 'outbound';
  unreadCount: number;
  botEnabled: boolean;
  status: string;
  state?: ConversationState;
  context?: Record<string, unknown>;
}

export const stateConfig: Record<ConversationState, { label: string; colorClass: string }> = {
  'NEW': { label: 'New', colorClass: 'bg-[hsl(var(--state-new))]' },
  'AWAITING_INTENT': { label: 'Menu', colorClass: 'bg-[hsl(var(--state-menu))]' },
  'BOOKING_SERVICE': { label: 'Booking', colorClass: 'bg-[hsl(var(--state-booking))]' },
  'BOOKING_DATE': { label: 'Booking', colorClass: 'bg-[hsl(var(--state-booking))]' },
  'BOOKING_NAME': { label: 'Booking', colorClass: 'bg-[hsl(var(--state-booking))]' },
  'BOOKING_CONFIRM': { label: 'Confirm Booking', colorClass: 'bg-[hsl(var(--state-confirm))]' },
  'ORDERING_ITEMS': { label: 'Ordering', colorClass: 'bg-[hsl(var(--state-ordering))]' },
  'FAQ': { label: 'FAQ', colorClass: 'bg-[hsl(var(--state-faq))]' },
  'HUMAN_REVIEW': { label: '🔴 Agent Required', colorClass: 'bg-[hsl(var(--state-human))]' },
};
