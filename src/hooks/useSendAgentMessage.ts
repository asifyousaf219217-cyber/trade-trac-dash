import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useBusiness } from './useBusiness';
import { useWhatsAppNumber } from './useWhatsApp';
import { toast } from 'sonner';
interface SendMessageParams {
  conversationId: string;
  customerPhone: string;
  messageText: string;
}
export function useSendAgentMessage() {
  const { data: business } = useBusiness();
  const { data: whatsappNumber } = useWhatsAppNumber();
  return useMutation({
    mutationFn: async ({ conversationId, customerPhone, messageText }: SendMessageParams) => {
      if (!business?.id) {
        throw new Error('Business not found');
      }
      const businessPhoneNumber = whatsappNumber?.display_phone_number || 'business';
      // 1. Save message to Supabase
      const { error: insertError } = await supabase.from('messages').insert({
        business_id: business.id,
        conversation_id: conversationId,
        from_number: businessPhoneNumber,
        to_number: customerPhone,
        message_text: messageText,
        direction: 'outbound' as const,
        source: 'human' as const,
      });
      if (insertError) {
        throw insertError;
      }
      // 2. Call n8n webhook to send via WhatsApp
      const webhookUrl = 'https://asifyousaf.app.n8n.cloud/webhook/agent-send-message';
      try {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            business_id: business.id,
            conversation_id: conversationId,
            customer_phone: customerPhone,
            message_text: messageText,
            source: 'agent',
          }),
        });
        if (!response.ok) {
          console.warn('Webhook call failed, but message saved to DB');
        }
      } catch (webhookError) {
        console.warn('Webhook unreachable, but message saved to DB:', webhookError);
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
