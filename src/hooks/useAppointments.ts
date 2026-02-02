import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useBusiness } from './useBusiness';
import type { Appointment, AppointmentStatus, AppointmentUpdate } from '@/types/database';

export function useAppointments() {
  const { data: business } = useBusiness();

  return useQuery({
    queryKey: ['appointments', business?.id],
    queryFn: async () => {
      if (!business) return [];

      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('business_id', business.id)
        .order('scheduled_at', { ascending: true });

      if (error) throw error;
      return data as Appointment[];
    },
    enabled: !!business,
  });
}

export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ appointmentId, status }: { appointmentId: string; status: AppointmentStatus }) => {
      const updateData: AppointmentUpdate = { status };
      const { data, error } = await supabase
        .from('appointments')
        .update(updateData)
        .eq('id', appointmentId)
        .select()
        .single();

      if (error) throw error;
      return data as Appointment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}

export function useAppointmentStats() {
  const { data: appointments = [] } = useAppointments();
  
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);
  
  const weekEnd = new Date(todayStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const todayAppointments = appointments.filter((apt) => {
    const date = new Date(apt.scheduled_at);
    return date >= todayStart && date <= todayEnd;
  });

  const weekAppointments = appointments.filter((apt) => {
    const date = new Date(apt.scheduled_at);
    return date >= todayStart && date <= weekEnd;
  });

  return {
    total: appointments.length,
    today: todayAppointments.length,
    thisWeek: weekAppointments.length,
    pending: appointments.filter((a) => a.status === 'pending').length,
    confirmed: appointments.filter((a) => a.status === 'confirmed').length,
    cancelled: appointments.filter((a) => a.status === 'cancelled').length,
    todayAppointments,
  };
}
