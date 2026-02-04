import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useBusiness } from './useBusiness';
import { toast } from 'sonner';

interface SendMessageParams {
  conversationId: string;
  customerPhone: string;
  messageText: string;
}

export function useSendAgentMessage() {
  const { data: business } = useBusiness();

  return useMutation({
    mutationFn: async ({ conversationId, customerPhone, messageText }: SendMessageParams) => {
      if (!business?.id) {
        throw new Error('Business not found');
      }

      // Get current session for auth header
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      // Call secure edge function instead of n8n directly
      const { data, error } = await supabase.functions.invoke('send-whatsapp-message', {
        body: {
          business_id: business.id,
          conversation_id: conversationId,
          customer_phone: customerPhone,
          message_text: messageText,
        },
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to send message');
      }

      return { success: true };
    },
    onSuccess: () => {
      toast.success('Message sent!');
    },
    onError: (error) => {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    },
  });
}
