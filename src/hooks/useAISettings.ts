import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useBusiness } from './useBusiness';

interface AIFeatures {
  intent_detection: boolean;
  datetime_assist: boolean;
  faq_answers: boolean;
}

interface AIConfig {
  ai_enabled: boolean | null;
  ai_features: AIFeatures | null;
}

interface AISettingsUpdate {
  ai_enabled?: boolean;
  ai_features?: AIFeatures;
  ai_api_key_encrypted?: string;
}

export function useAISettings() {
  const { data: business } = useBusiness();

  return useQuery({
    queryKey: ['ai-config', business?.id],
    queryFn: async () => {
      if (!business) return null;

      const { data, error } = await supabase
        .from('bot_configs')
        .select('ai_enabled, ai_features')
        .eq('business_id', business.id)
        .maybeSingle();

      if (error) throw error;
      return data as AIConfig | null;
    },
    enabled: !!business,
  });
}

export function useHasGeminiKey() {
  const { data: business } = useBusiness();

  return useQuery({
    queryKey: ['has-gemini-key', business?.id],
    queryFn: async () => {
      if (!business) return false;

      const { data, error } = await supabase
        .from('bot_configs')
        .select('ai_api_key_encrypted')
        .eq('business_id', business.id)
        .maybeSingle();

      if (error) return false;
      return !!data?.ai_api_key_encrypted;
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
        .from('bot_configs')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('business_id', business.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-config'] });
      queryClient.invalidateQueries({ queryKey: ['has-gemini-key'] });
      queryClient.invalidateQueries({ queryKey: ['bot-config'] });
    },
  });
}
