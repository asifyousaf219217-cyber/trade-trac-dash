import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useBusiness } from './useBusiness';
import type { BookingStep } from '@/types/bot-config';

export function useBookingSteps() {
  const { data: business } = useBusiness();

  return useQuery({
    queryKey: ['booking_steps', business?.id],
    queryFn: async () => {
      if (!business?.id) return [];

      const { data, error } = await supabase
        .from('booking_steps')
        .select('*')
        .eq('business_id', business.id)
        .order('step_order');

      if (error) throw error;
      return data as BookingStep[];
    },
    enabled: !!business?.id,
  });
}

export function useCreateBookingStep() {
  const queryClient = useQueryClient();
  const { data: business } = useBusiness();

  return useMutation({
    mutationFn: async (step: Partial<BookingStep>) => {
      if (!business?.id) throw new Error('No business found');

      // Get the next step order
      const { data: existingSteps } = await supabase
        .from('booking_steps')
        .select('step_order')
        .eq('business_id', business.id)
        .order('step_order', { ascending: false })
        .limit(1);

      const nextOrder = existingSteps && existingSteps.length > 0 
        ? existingSteps[0].step_order + 1 
        : 1;

      const { data, error } = await supabase
        .from('booking_steps')
        .insert({
          business_id: business.id,
          step_order: step.step_order ?? nextOrder,
          step_type: step.step_type || 'CUSTOM',
          prompt_text: step.prompt_text || 'Enter your response:',
          validation_type: step.validation_type || 'text',
          // Interactive input fields
          input_type: step.input_type || 'TEXT',
          expected_values: step.expected_values || [],
          validation_regex: step.validation_regex || null,
          retry_message: step.retry_message || null,
          // List control fields
          list_source: step.list_source || 'custom',
          list_items: step.list_items || [],
          is_required: step.is_required ?? true,
          is_enabled: step.is_enabled ?? true,
        })
        .select()
        .single();

      if (error) throw error;
      return data as BookingStep;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking_steps'] });
    },
  });
}

export function useUpdateBookingStep() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<BookingStep> }) => {
      const { data, error } = await supabase
        .from('booking_steps')
        .update({
          step_order: updates.step_order,
          step_type: updates.step_type,
          prompt_text: updates.prompt_text,
          validation_type: updates.validation_type,
          // Interactive input fields
          input_type: updates.input_type,
          expected_values: updates.expected_values,
          validation_regex: updates.validation_regex,
          retry_message: updates.retry_message,
          // List control fields
          list_source: updates.list_source,
          list_items: updates.list_items,
          is_required: updates.is_required,
          is_enabled: updates.is_enabled,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as BookingStep;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking_steps'] });
    },
  });
}

export function useDeleteBookingStep() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (stepId: string) => {
      const { error } = await supabase
        .from('booking_steps')
        .delete()
        .eq('id', stepId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking_steps'] });
    },
  });
}

export function useReorderBookingSteps() {
  const queryClient = useQueryClient();
  const { data: business } = useBusiness();

  return useMutation({
    mutationFn: async (steps: BookingStep[]) => {
      if (!business?.id) throw new Error('No business found');

      // Update step_order for all steps
      const updates = steps.map((step, index) =>
        supabase
          .from('booking_steps')
          .update({ step_order: index + 1 })
          .eq('id', step.id)
      );

      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking_steps'] });
    },
  });
}