import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useBusiness } from './useBusiness';
import type { Message } from '@/types/database';

export interface Conversation {
  customerNumber: string;
  customerName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: Message[];
  source: 'bot' | 'human';
}

export function useMessages() {
  const { data: business } = useBusiness();

  return useQuery({
    queryKey: ['messages', business?.id],
    queryFn: async () => {
      if (!business) return [];

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('business_id', business.id)
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) throw error;
      return data as Message[];
    },
    enabled: !!business,
  });
}

export function useConversations() {
  const { data: messages = [], ...rest } = useMessages();

  // Group messages by customer number
  const conversations: Conversation[] = [];
  const messagesByCustomer = new Map<string, Message[]>();

  messages.forEach((msg) => {
    const customerNumber = msg.direction === 'inbound' ? msg.from_number : (msg.to_number || '');
    if (!messagesByCustomer.has(customerNumber)) {
      messagesByCustomer.set(customerNumber, []);
    }
    messagesByCustomer.get(customerNumber)!.push(msg);
  });

  messagesByCustomer.forEach((msgs, customerNumber) => {
    const sortedMsgs = [...msgs].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    const lastMessage = sortedMsgs[sortedMsgs.length - 1];
    
    conversations.push({
      customerNumber,
      customerName: customerNumber,
      lastMessage: lastMessage.message_text,
      lastMessageTime: lastMessage.created_at,
      unreadCount: 0,
      messages: sortedMsgs,
      source: lastMessage.source,
    });
  });

  conversations.sort(
    (a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
  );

  return { data: conversations, ...rest };
}

export function useMessageStats() {
  const { data: messages = [] } = useMessages();
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayMessages = messages.filter(m => new Date(m.created_at) >= today);
  
  return {
    total: messages.length,
    today: todayMessages.length,
  };
}
