-- Create enum types
CREATE TYPE public.verification_status AS ENUM ('not_connected', 'verifying', 'connected');
CREATE TYPE public.bot_type AS ENUM ('restaurant', 'salon', 'ecommerce', 'faq');
CREATE TYPE public.message_direction AS ENUM ('inbound', 'outbound');
CREATE TYPE public.message_source AS ENUM ('bot', 'human');
CREATE TYPE public.order_status AS ENUM ('pending', 'accepted', 'rejected', 'completed', 'cancelled');
CREATE TYPE public.appointment_status AS ENUM ('pending', 'confirmed', 'cancelled');

-- Create businesses table
CREATE TABLE public.businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create whatsapp_numbers table
CREATE TABLE public.whatsapp_numbers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  phone_number_id TEXT,
  business_account_id TEXT,
  display_phone_number TEXT,
  verification_status public.verification_status DEFAULT 'not_connected' NOT NULL,
  access_token_encrypted TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create bots table (marketplace bots - public)
CREATE TABLE public.bots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type public.bot_type NOT NULL,
  description TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create bot_configs table (user's bot configuration)
CREATE TABLE public.bot_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL UNIQUE,
  bot_id UUID REFERENCES public.bots(id) ON DELETE SET NULL,
  greeting_message TEXT DEFAULT 'Hello! How can I help you today?',
  static_replies JSONB DEFAULT '[]'::jsonb,
  order_enabled BOOLEAN DEFAULT false,
  appointment_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  from_number TEXT NOT NULL,
  to_number TEXT,
  message_text TEXT NOT NULL,
  direction public.message_direction NOT NULL,
  source public.message_source NOT NULL,
  whatsapp_message_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  customer_number TEXT NOT NULL,
  customer_name TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  total_amount DECIMAL(10,2),
  status public.order_status DEFAULT 'pending' NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create appointments table
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  customer_number TEXT NOT NULL,
  customer_name TEXT,
  service TEXT,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status public.appointment_status DEFAULT 'pending' NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create ai_settings table
CREATE TABLE public.ai_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL UNIQUE,
  ai_enabled BOOLEAN DEFAULT false,
  gemini_api_key_encrypted TEXT,
  ai_model TEXT DEFAULT 'gemini-pro',
  system_prompt TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create indexes for performance
CREATE INDEX idx_businesses_user_id ON public.businesses(user_id);
CREATE INDEX idx_whatsapp_numbers_business_id ON public.whatsapp_numbers(business_id);
CREATE INDEX idx_whatsapp_numbers_phone_number_id ON public.whatsapp_numbers(phone_number_id);
CREATE INDEX idx_bot_configs_business_id ON public.bot_configs(business_id);
CREATE INDEX idx_messages_business_id ON public.messages(business_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX idx_orders_business_id ON public.orders(business_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_appointments_business_id ON public.appointments(business_id);
CREATE INDEX idx_appointments_scheduled_at ON public.appointments(scheduled_at);
CREATE INDEX idx_ai_settings_business_id ON public.ai_settings(business_id);

-- Enable RLS on all tables
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_settings ENABLE ROW LEVEL SECURITY;

-- Helper function to get user's business_id
CREATE OR REPLACE FUNCTION public.get_user_business_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.businesses WHERE user_id = _user_id LIMIT 1
$$;

-- RLS Policies for businesses
CREATE POLICY "Users can view own businesses" ON public.businesses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own businesses" ON public.businesses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own businesses" ON public.businesses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own businesses" ON public.businesses
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for whatsapp_numbers
CREATE POLICY "Users can view own whatsapp_numbers" ON public.whatsapp_numbers
  FOR SELECT USING (business_id = public.get_user_business_id(auth.uid()));

CREATE POLICY "Users can create own whatsapp_numbers" ON public.whatsapp_numbers
  FOR INSERT WITH CHECK (business_id = public.get_user_business_id(auth.uid()));

CREATE POLICY "Users can update own whatsapp_numbers" ON public.whatsapp_numbers
  FOR UPDATE USING (business_id = public.get_user_business_id(auth.uid()));

CREATE POLICY "Users can delete own whatsapp_numbers" ON public.whatsapp_numbers
  FOR DELETE USING (business_id = public.get_user_business_id(auth.uid()));

-- RLS Policies for bots (public read for marketplace)
CREATE POLICY "Anyone can view bots" ON public.bots
  FOR SELECT USING (true);

-- RLS Policies for bot_configs
CREATE POLICY "Users can view own bot_configs" ON public.bot_configs
  FOR SELECT USING (business_id = public.get_user_business_id(auth.uid()));

CREATE POLICY "Users can create own bot_configs" ON public.bot_configs
  FOR INSERT WITH CHECK (business_id = public.get_user_business_id(auth.uid()));

CREATE POLICY "Users can update own bot_configs" ON public.bot_configs
  FOR UPDATE USING (business_id = public.get_user_business_id(auth.uid()));

CREATE POLICY "Users can delete own bot_configs" ON public.bot_configs
  FOR DELETE USING (business_id = public.get_user_business_id(auth.uid()));

-- RLS Policies for messages
CREATE POLICY "Users can view own messages" ON public.messages
  FOR SELECT USING (business_id = public.get_user_business_id(auth.uid()));

CREATE POLICY "Users can create own messages" ON public.messages
  FOR INSERT WITH CHECK (business_id = public.get_user_business_id(auth.uid()));

-- RLS Policies for orders
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (business_id = public.get_user_business_id(auth.uid()));

CREATE POLICY "Users can create own orders" ON public.orders
  FOR INSERT WITH CHECK (business_id = public.get_user_business_id(auth.uid()));

CREATE POLICY "Users can update own orders" ON public.orders
  FOR UPDATE USING (business_id = public.get_user_business_id(auth.uid()));

-- RLS Policies for appointments
CREATE POLICY "Users can view own appointments" ON public.appointments
  FOR SELECT USING (business_id = public.get_user_business_id(auth.uid()));

CREATE POLICY "Users can create own appointments" ON public.appointments
  FOR INSERT WITH CHECK (business_id = public.get_user_business_id(auth.uid()));

CREATE POLICY "Users can update own appointments" ON public.appointments
  FOR UPDATE USING (business_id = public.get_user_business_id(auth.uid()));

-- RLS Policies for ai_settings
CREATE POLICY "Users can view own ai_settings" ON public.ai_settings
  FOR SELECT USING (business_id = public.get_user_business_id(auth.uid()));

CREATE POLICY "Users can create own ai_settings" ON public.ai_settings
  FOR INSERT WITH CHECK (business_id = public.get_user_business_id(auth.uid()));

CREATE POLICY "Users can update own ai_settings" ON public.ai_settings
  FOR UPDATE USING (business_id = public.get_user_business_id(auth.uid()));

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_businesses_updated_at
  BEFORE UPDATE ON public.businesses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_whatsapp_numbers_updated_at
  BEFORE UPDATE ON public.whatsapp_numbers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bot_configs_updated_at
  BEFORE UPDATE ON public.bot_configs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_settings_updated_at
  BEFORE UPDATE ON public.ai_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to auto-create related records when business is created
CREATE OR REPLACE FUNCTION public.handle_new_business()
RETURNS TRIGGER AS $$
BEGIN
  -- Create default bot_config
  INSERT INTO public.bot_configs (business_id)
  VALUES (NEW.id);
  
  -- Create default ai_settings
  INSERT INTO public.ai_settings (business_id)
  VALUES (NEW.id);
  
  -- Create default whatsapp_number entry
  INSERT INTO public.whatsapp_numbers (business_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_business_created
  AFTER INSERT ON public.businesses
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_business();

-- Insert default marketplace bots
INSERT INTO public.bots (name, type, description, features, icon) VALUES
('Restaurant Bot', 'restaurant', 'Complete restaurant ordering bot with menu management, order taking, and delivery tracking.', '["Menu display", "Order taking", "Delivery tracking", "Table reservations"]', 'utensils'),
('Salon Bot', 'salon', 'Appointment booking bot for salons and spas with service catalog and scheduling.', '["Service catalog", "Appointment booking", "Reminders", "Staff scheduling"]', 'scissors'),
('E-commerce Bot', 'ecommerce', 'Full-featured e-commerce bot with product catalog, cart, and checkout.', '["Product catalog", "Shopping cart", "Order tracking", "Payment links"]', 'shopping-cart'),
('FAQ Bot', 'faq', 'Intelligent FAQ bot that answers common questions using AI or predefined responses.', '["Smart Q&A", "Knowledge base", "Escalation to human", "Multi-language"]', 'message-circle');