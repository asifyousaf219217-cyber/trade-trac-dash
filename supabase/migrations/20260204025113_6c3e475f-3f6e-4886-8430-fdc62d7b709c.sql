-- Enable RLS on all public tables that currently have it disabled
-- This is critical to prevent unauthorized data access

-- Core business tables
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for conversations (accessed by business owner)
CREATE POLICY "Users can view own conversations" ON public.conversations
  FOR SELECT USING (business_id = public.get_user_business_id(auth.uid()));

CREATE POLICY "Users can create own conversations" ON public.conversations
  FOR INSERT WITH CHECK (business_id = public.get_user_business_id(auth.uid()));

CREATE POLICY "Users can update own conversations" ON public.conversations
  FOR UPDATE USING (business_id = public.get_user_business_id(auth.uid()));

CREATE POLICY "Users can delete own conversations" ON public.conversations
  FOR DELETE USING (business_id = public.get_user_business_id(auth.uid()));

-- Service role policy for conversations (for edge functions/webhooks)
CREATE POLICY "Service role full access to conversations" ON public.conversations
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Create RLS policies for conversation_logs
CREATE POLICY "Users can view own conversation_logs" ON public.conversation_logs
  FOR SELECT USING (business_id = public.get_user_business_id(auth.uid()));

CREATE POLICY "Users can create own conversation_logs" ON public.conversation_logs
  FOR INSERT WITH CHECK (business_id = public.get_user_business_id(auth.uid()));

CREATE POLICY "Service role full access to conversation_logs" ON public.conversation_logs
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Create RLS policies for whatsapp_sessions (linked via conversation)
CREATE POLICY "Users can view own whatsapp_sessions" ON public.whatsapp_sessions
  FOR SELECT USING (
    conversation_id IN (
      SELECT id FROM public.conversations 
      WHERE business_id = public.get_user_business_id(auth.uid())
    )
  );

CREATE POLICY "Users can manage own whatsapp_sessions" ON public.whatsapp_sessions
  FOR ALL USING (
    conversation_id IN (
      SELECT id FROM public.conversations 
      WHERE business_id = public.get_user_business_id(auth.uid())
    )
  );

CREATE POLICY "Service role full access to whatsapp_sessions" ON public.whatsapp_sessions
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Add service role policies for other tables that edge functions need to access
CREATE POLICY "Service role full access to messages" ON public.messages
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access to appointments" ON public.appointments
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access to bot_configs" ON public.bot_configs
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access to businesses" ON public.businesses
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access to whatsapp_numbers" ON public.whatsapp_numbers
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access to orders" ON public.orders
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access to ai_settings" ON public.ai_settings
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access to booking_steps" ON public.booking_steps
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access to interactive_menus" ON public.interactive_menus
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access to menu_buttons" ON public.menu_buttons
  FOR ALL TO service_role USING (true) WITH CHECK (true);