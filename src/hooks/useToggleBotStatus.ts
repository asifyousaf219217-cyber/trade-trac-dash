import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useBusiness } from './useBusiness';
import { toast } from 'sonner';

export function useToggleBotStatus() {
  const queryClient = useQueryClient();
  const { data: business } = useBusiness();

  return useMutation({
    mutationFn: async ({ conversationId, botEnabled }: { conversationId: string; botEnabled: boolean }) => {
      if (!business?.id) throw new Error('Business not found');

      const { error } = await supabase
        .from('conversations')
        .update({ bot_enabled: botEnabled })
        .eq('id', conversationId)
        .eq('business_id', business.id);

      if (error) throw error;
      return { conversationId, botEnabled };
    },
    onSuccess: (data) => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['conversations', business?.id] });
      queryClient.invalidateQueries({ queryKey: ['conversation', data.conversationId, business?.id] });
      
      toast.success(data.botEnabled ? 'Bot enabled for this conversation' : 'Human takeover activated');
    },
    onError: (error) => {
      console.error('Failed to toggle bot status:', error);
      toast.error('Failed to update conversation status');
    },
  });
}
