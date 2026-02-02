import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { ConversationState } from '@/types/chat';

interface UpdateConversationStateParams {
  conversationId: string;
  state?: ConversationState;
  botEnabled?: boolean;
  context?: Record<string, unknown>;
}

export function useUpdateConversationState() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ conversationId, state, botEnabled, context }: UpdateConversationStateParams) => {
      const updates: Record<string, unknown> = {};
      
      if (state !== undefined) {
        updates.status = state; // Using status field to store state
      }
      if (botEnabled !== undefined) {
        updates.bot_enabled = botEnabled;
      }
      if (context !== undefined) {
        updates.context = context;
      }

      const { error } = await supabase
        .from('conversations')
        .update(updates)
        .eq('id', conversationId);

      if (error) throw error;

      return { conversationId, ...updates };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['conversation', variables.conversationId] });
    },
    onError: (error) => {
      console.error('Failed to update conversation:', error);
      toast.error('Failed to update conversation');
    },
  });
}
