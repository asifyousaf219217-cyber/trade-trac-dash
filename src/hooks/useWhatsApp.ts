import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useBusiness } from './useBusiness';
import type { WhatsAppNumber, WhatsAppNumberUpdate } from '@/types/database';

export function useWhatsAppNumber() {
  const { data: business } = useBusiness();

  return useQuery({
    queryKey: ['whatsapp-number', business?.id],
    queryFn: async () => {
      if (!business) return null;

      const { data, error } = await supabase
        .from('whatsapp_numbers')
        .select('*')
        .eq('business_id', business.id)
        .maybeSingle();

      if (error) throw error;
      return data as WhatsAppNumber | null;
    },
    enabled: !!business,
  });
}

export function useUpdateWhatsAppNumber() {
  const queryClient = useQueryClient();
  const { data: business } = useBusiness();

  return useMutation({
    mutationFn: async (updates: WhatsAppNumberUpdate) => {
      if (!business) throw new Error('No business found');

      const { data, error } = await supabase
        .from('whatsapp_numbers')
        .update(updates)
        .eq('business_id', business.id)
        .select()
        .single();

      if (error) throw error;
      return data as WhatsAppNumber;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-number'] });
    },
  });
}
