import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useBusiness } from './useBusiness';
import type { ConversationData, ConversationState } from '@/types/chat';

interface ConversationRow {
  id: string;
  customer_phone: string;
  customer_name: string | null;
  status: string | null;
  bot_enabled: boolean | null;
  last_message_at: string | null;
  context: unknown;
  messages: {
    message_text: string;
    direction: 'inbound' | 'outbound';
    created_at: string;
  }[];
}

function mapConversation(row: ConversationRow): ConversationData {
  const lastMessage = row.messages?.[0];
  return {
    id: row.id,
    customerPhone: row.customer_phone,
    customerName: row.customer_name || undefined,
    lastMessage: lastMessage?.message_text || '',
    lastMessageTime: lastMessage?.created_at || row.last_message_at || '',
    lastMessageDirection: (lastMessage?.direction as 'inbound' | 'outbound') || 'inbound',
    unreadCount: 0,
    botEnabled: row.bot_enabled ?? true,
    status: row.status || 'active',
    state: (row.status as ConversationState) || 'NEW',
    context: row.context as Record<string, unknown> | undefined,
  };
}

// Re-export the type for backward compatibility
export type Conversation = ConversationData;

export function useConversations() {
  const { data: business } = useBusiness();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['conversations', business?.id],
    queryFn: async () => {
      if (!business) return [];

      // Query conversations with their latest message and context
      // Exclude preview/simulator conversations - these are ephemeral test conversations
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          id,
          customer_phone,
          customer_name,
          status,
          bot_enabled,
          last_message_at,
          context,
          messages (
            message_text,
            direction,
            created_at
          )
        `)
        .eq('business_id', business.id)
        .not('customer_phone', 'ilike', '%preview%')
        .not('customer_phone', 'ilike', '%simulator%')
        .order('last_message_at', { ascending: false, nullsFirst: false })
        .limit(100);

      if (error) throw error;

      // Sort messages for each conversation to get the latest one
      const conversationsWithLatestMessage = (data || []).map((conv) => {
        const sortedMessages = [...(conv.messages || [])].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        return {
          ...conv,
          messages: sortedMessages.slice(0, 1),
        };
      });

      return conversationsWithLatestMessage.map(mapConversation);
    },
    enabled: !!business,
  });

  // Real-time subscription for conversations
  useEffect(() => {
    if (!business?.id) return;

    const channel = supabase
      .channel(`conversations:${business.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `business_id=eq.${business.id}`,
        },
        () => {
          // Refetch conversations when any change happens
          queryClient.invalidateQueries({ queryKey: ['conversations', business.id] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `business_id=eq.${business.id}`,
        },
        () => {
          // Refetch conversations when new messages arrive
          queryClient.invalidateQueries({ queryKey: ['conversations', business.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [business?.id, queryClient]);

  return query;
}

export function useConversation(conversationId: string | null) {
  const { data: business } = useBusiness();

  return useQuery({
    queryKey: ['conversation', conversationId, business?.id],
    queryFn: async () => {
      if (!conversationId || !business?.id) return null;

      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .eq('business_id', business.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!conversationId && !!business?.id,
  });
}
