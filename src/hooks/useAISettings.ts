import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useBusiness } from './useBusiness';
import type { AISettings, AISettingsUpdate } from '@/types/database';

export function useAISettings() {
  const { data: business } = useBusiness();

  return useQuery({
    queryKey: ['ai-settings', business?.id],
    queryFn: async () => {
      if (!business) return null;

      const { data, error } = await supabase
        .from('ai_settings')
        .select('*')
        .eq('business_id', business.id)
        .maybeSingle();

      if (error) throw error;
      return data as AISettings | null;
    },
    enabled: !!business,
  });
}

export function useUpdateAISettings() {
  const queryClient = useQueryClient();
  const { data: business } = useBusiness();

  return useMutation({
    mutationFn: async (updates: AISettingsUpdate) => {
      if (!business) throw new Error('No business found');

      const { data, error } = await supabase
        .from('ai_settings')
        .update(updates)
        .eq('business_id', business.id)
        .select()
        .single();

      if (error) throw error;
      return data as AISettings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-settings'] });
    },
  });
}
