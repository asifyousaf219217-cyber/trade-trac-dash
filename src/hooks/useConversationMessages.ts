import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import type { ChatMessageData, MessageMetadata } from '@/types/chat';

type MessageRow = Database['public']['Tables']['messages']['Row'];

function mapMessage(row: MessageRow): ChatMessageData {
  return {
    id: row.id,
    conversation_id: row.conversation_id || '',
    from_number: row.from_number,
    to_number: row.to_number,
    message_text: row.message_text,
    direction: row.direction,
    source: row.source,
    metadata: row.metadata as MessageMetadata | null,
    created_at: row.created_at,
  };
}

// Re-export for backward compatibility
export type ChatMessage = ChatMessageData;

export function useConversationMessages(conversationId: string | null): { data: ChatMessageData[]; isLoading: boolean; error: Error | null } {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      if (!conversationId) return [];

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return (data || []).map(mapMessage);
    },
    enabled: !!conversationId,
  });

  // Real-time subscription for messages
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          // Add new message to cache immediately for instant UI update
          queryClient.setQueryData(
            ['messages', conversationId],
            (old: ChatMessageData[] | undefined) => {
              if (!old) return [mapMessage(payload.new as MessageRow)];
              // Check if message already exists to avoid duplicates
              if (old.some((m) => m.id === (payload.new as MessageRow).id)) {
                return old;
              }
              return [...old, mapMessage(payload.new as MessageRow)];
            }
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, queryClient]);

  return query;
}
