import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useBusiness } from './useBusiness';
import type { FAQ, StaticReply, AppointmentPrompts, OrderPrompts } from '@/types/bot-config';
import { WORKING_HOURS_KEYWORDS, MENU_SERVICES_KEYWORDS, generateFAQId } from '@/types/bot-config';

export interface BotConfigData {
  id: string;
  business_id: string;
  greeting_message: string | null;
  static_replies: StaticReply[];
  is_active: boolean | null;
  fallback_message: string | null;
  unknown_message_help: string | null;
  ai_fallback: boolean | null;
  ai_enabled: boolean | null;
  order_enabled: boolean | null;
  appointment_enabled: boolean | null;
  appointment_prompts: AppointmentPrompts | null;
  order_prompts: OrderPrompts | null;
  selected_template: string | null;
  cancellation_enabled: boolean | null;
  // NEW: Template tracking fields
  active_template_id: string | null;
  template_applied_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BotConfigUpdate {
  greeting_message?: string;
  static_replies?: StaticReply[];
  is_active?: boolean;
  fallback_message?: string;
  unknown_message_help?: string;
  ai_fallback?: boolean;
  order_enabled?: boolean;
  appointment_enabled?: boolean;
  appointment_prompts?: AppointmentPrompts;
  order_prompts?: OrderPrompts;
}

/**
 * Parse static replies from database back to UI format
 */
export function parseStaticRepliesToUI(staticReplies: StaticReply[]) {
  let workingHours = '';
  let menuServices = '';
  const faqs: FAQ[] = [];

  for (const reply of staticReplies) {
    const keywords = reply.keywords || [];
    
    // Check if this is a working hours reply
    const isHoursReply = keywords.some(k => 
      WORKING_HOURS_KEYWORDS.includes(k.toLowerCase())
    );
    
    // Check if this is a menu/services reply
    const isMenuReply = keywords.some(k => 
      MENU_SERVICES_KEYWORDS.includes(k.toLowerCase())
    );

    if (isHoursReply && !workingHours) {
      workingHours = reply.reply;
    } else if (isMenuReply && !menuServices) {
      menuServices = reply.reply;
    } else {
      // It's a FAQ
      faqs.push({
        id: generateFAQId(),
        question: keywords.join(' ') + '?',
        answer: reply.reply,
        keywords: keywords,
      });
    }
  }

  return { workingHours, menuServices, faqs };
}

/**
 * Convert UI format to static replies for database
 */
export function convertToStaticReplies(
  workingHours: string,
  menuServices: string,
  faqs: FAQ[]
): StaticReply[] {
  const staticReplies: StaticReply[] = [];

  // Add working hours
  if (workingHours.trim()) {
    staticReplies.push({
      keywords: WORKING_HOURS_KEYWORDS,
      reply: workingHours.trim(),
    });
  }

  // Add menu/services
  if (menuServices.trim()) {
    staticReplies.push({
      keywords: MENU_SERVICES_KEYWORDS,
      reply: menuServices.trim(),
    });
  }

  // Add FAQs
  for (const faq of faqs) {
    if (faq.answer.trim() && faq.keywords.length > 0) {
      staticReplies.push({
        keywords: faq.keywords,
        reply: faq.answer.trim(),
      });
    }
  }

  return staticReplies;
}

export function useBotConfig() {
  const { data: business } = useBusiness();

  return useQuery({
    queryKey: ['bot_config', business?.id],
    queryFn: async () => {
      if (!business) return null;

      const { data, error } = await supabase
        .from('bot_configs')
        .select('*')
        .eq('business_id', business.id)
        .maybeSingle();

      if (error) throw error;
      
      // Parse static_replies from JSON
      if (data) {
        return {
          ...data,
          static_replies: Array.isArray(data.static_replies) 
            ? data.static_replies as StaticReply[]
            : [],
          appointment_prompts: (data.appointment_prompts as AppointmentPrompts) || {},
          order_prompts: (data.order_prompts as OrderPrompts) || {},
        } as BotConfigData;
      }
      return null;
    },
    enabled: !!business,
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
        .upsert({
          business_id: business.id,
          ...updates,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'business_id',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bot_config'] });
    },
  });
}

// Re-export types for convenience
export type { FAQ, StaticReply, AppointmentPrompts, OrderPrompts } from '@/types/bot-config';
