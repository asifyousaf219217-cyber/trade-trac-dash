import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useBusiness } from './useBusiness';
import type { Bot, BotConfig, BotConfigUpdate } from '@/types/database';

export function useBots() {
  return useQuery({
    queryKey: ['bots'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bots')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as Bot[];
    },
  });
}

export function useBotConfig() {
  const { data: business } = useBusiness();

  return useQuery({
    queryKey: ['bot-config', business?.id],
    queryFn: async () => {
      if (!business) return null;

      const { data, error } = await supabase
        .from('bot_configs')
        .select('*')
        .eq('business_id', business.id)
        .maybeSingle();

      if (error) throw error;
      return data as BotConfig | null;
    },
    enabled: !!business,
  });
}

export function useSelectBot() {
  const queryClient = useQueryClient();
  const { data: business } = useBusiness();

  return useMutation({
    mutationFn: async (botId: string) => {
      if (!business) throw new Error('No business found');

      const updateData: BotConfigUpdate = { bot_id: botId };
      const { data, error } = await supabase
        .from('bot_configs')
        .update(updateData)
        .eq('business_id', business.id)
        .select()
        .single();

      if (error) throw error;
      return data as BotConfig;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bot-config'] });
    },
  });
}

export function useUpdateBotConfig() {
  const queryClient = useQueryClient();
  const { data: business } = useBusiness();

  return useMutation({
    mutationFn: async (updates: BotConfigUpdate) => {
      if (!business) throw new Error('No business found');

      const { data, error } = await supabase
        .from('bot_configs')
        .update(updates)
        .eq('business_id', business.id)
        .select()
        .single();

      if (error) throw error;
      return data as BotConfig;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bot-config'] });
    },
  });
}

export function useSelectedBot() {
  const { data: bots } = useBots();
  const { data: config } = useBotConfig();

  if (!bots || !config || !config.bot_id) return null;
  return bots.find((b) => b.id === config.bot_id) || null;
}
