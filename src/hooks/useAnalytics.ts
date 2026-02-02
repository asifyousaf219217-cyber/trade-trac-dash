import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useBusiness } from './useBusiness';

export function useAnalytics() {
  const { data: business } = useBusiness();

  return useQuery({
    queryKey: ['analytics', business?.id],
    queryFn: async () => {
      if (!business) return null;

      const now = new Date();
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);

      // Fetch messages for the last 7 days
      const { data: messages } = await supabase
        .from('messages')
        .select('*')
        .eq('business_id', business.id)
        .gte('created_at', weekAgo.toISOString())
        .order('created_at');

      // Fetch orders for the last 7 days
      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .eq('business_id', business.id)
        .gte('created_at', weekAgo.toISOString())
        .order('created_at');

      // Fetch appointments for the last 7 days
      const { data: appointments } = await supabase
        .from('appointments')
        .select('*')
        .eq('business_id', business.id)
        .gte('scheduled_at', weekAgo.toISOString())
        .order('scheduled_at');

      // Group by day
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dailyData = [];
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);

        const dayMessages = (messages || []).filter((m) => {
          const d = new Date(m.created_at);
          return d >= dayStart && d <= dayEnd;
        });

        const dayOrders = (orders || []).filter((o) => {
          const d = new Date(o.created_at);
          return d >= dayStart && d <= dayEnd;
        });

        const dayAppointments = (appointments || []).filter((a) => {
          const d = new Date(a.scheduled_at);
          return d >= dayStart && d <= dayEnd;
        });

        dailyData.push({
          date: days[date.getDay()],
          messages: dayMessages.length,
          orders: dayOrders.length,
          appointments: dayAppointments.length,
        });
      }

      // AI vs Human responses
      const botMessages = (messages || []).filter((m) => m.source === 'bot');
      const humanMessages = (messages || []).filter((m) => m.source === 'human');

      return {
        totalMessages: (messages || []).length,
        totalOrders: (orders || []).length,
        totalAppointments: (appointments || []).length,
        dailyData,
        messagesData: dailyData.map(d => ({ date: d.date, messages: d.messages })),
        ordersData: dailyData.map(d => ({ date: d.date, orders: d.orders })),
        appointmentsData: dailyData.map(d => ({ date: d.date, appointments: d.appointments })),
        aiVsStatic: [
          { name: 'Bot Responses', value: botMessages.length, color: 'hsl(142, 70%, 45%)' },
          { name: 'Human Responses', value: humanMessages.length, color: 'hsl(210, 20%, 80%)' },
        ],
      };
    },
    enabled: !!business,
  });
}
