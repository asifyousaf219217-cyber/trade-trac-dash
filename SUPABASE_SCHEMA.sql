-- =============================================
-- WHATSAPP BOT PLATFORM - SUPABASE SCHEMA
-- Run this in your Supabase SQL Editor
-- =============================================

-- 1. ENABLE UUID EXTENSION
create extension if not exists "uuid-ossp";

-- 2. CREATE ENUM TYPES
create type public.verification_status as enum ('not_connected', 'verifying', 'connected');
create type public.message_direction as enum ('inbound', 'outbound');
create type public.message_source as enum ('bot', 'human');
create type public.order_status as enum ('pending', 'accepted', 'completed', 'cancelled');
create type public.appointment_status as enum ('pending', 'confirmed', 'cancelled', 'no_show');
create type public.bot_type as enum ('restaurant', 'salon', 'ecommerce', 'faq');

-- 3. CREATE TABLES

-- Businesses table
create table public.businesses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  timezone text default 'UTC',
  address text,
  phone text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- WhatsApp Numbers table
create table public.whatsapp_numbers (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references public.businesses(id) on delete cascade not null,
  phone_number text not null,
  phone_number_id text,
  business_account_id text,
  verification_status verification_status default 'not_connected' not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Bots table (template bots in marketplace)
create table public.bots (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  type bot_type not null,
  description text,
  use_case text,
  features jsonb default '[]'::jsonb,
  example_replies jsonb default '[]'::jsonb,
  icon text,
  created_at timestamp with time zone default now() not null
);

-- Bot Configs table (user's bot configuration)
create table public.bot_configs (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references public.businesses(id) on delete cascade not null unique,
  bot_id uuid references public.bots(id) on delete set null,
  greeting_message text default 'Welcome! How can I help you today?',
  static_replies jsonb default '[]'::jsonb,
  menu_services text,
  working_hours text,
  order_enabled boolean default false,
  appointment_enabled boolean default false,
  is_active boolean default false,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Messages table
create table public.messages (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references public.businesses(id) on delete cascade not null,
  from_number text not null,
  to_number text,
  message_text text not null,
  direction message_direction not null,
  source message_source default 'bot' not null,
  created_at timestamp with time zone default now() not null
);

-- Orders table
create table public.orders (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references public.businesses(id) on delete cascade not null,
  customer_name text,
  customer_number text not null,
  details jsonb default '{}'::jsonb,
  total numeric(10,2),
  status order_status default 'pending' not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Appointments table
create table public.appointments (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references public.businesses(id) on delete cascade not null,
  customer_name text,
  customer_number text not null,
  service text,
  scheduled_at timestamp with time zone not null,
  status appointment_status default 'pending' not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- AI Settings table
create table public.ai_settings (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references public.businesses(id) on delete cascade not null unique,
  ai_enabled boolean default false,
  gemini_api_key text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- 4. CREATE INDEXES
create index idx_businesses_user_id on public.businesses(user_id);
create index idx_whatsapp_numbers_business_id on public.whatsapp_numbers(business_id);
create index idx_whatsapp_numbers_phone_number_id on public.whatsapp_numbers(phone_number_id);
create index idx_bot_configs_business_id on public.bot_configs(business_id);
create index idx_messages_business_id on public.messages(business_id);
create index idx_messages_created_at on public.messages(created_at);
create index idx_orders_business_id on public.orders(business_id);
create index idx_orders_status on public.orders(status);
create index idx_appointments_business_id on public.appointments(business_id);
create index idx_appointments_scheduled_at on public.appointments(scheduled_at);

-- 5. ENABLE ROW LEVEL SECURITY
alter table public.businesses enable row level security;
alter table public.whatsapp_numbers enable row level security;
alter table public.bots enable row level security;
alter table public.bot_configs enable row level security;
alter table public.messages enable row level security;
alter table public.orders enable row level security;
alter table public.appointments enable row level security;
alter table public.ai_settings enable row level security;

-- 6. CREATE RLS POLICIES

-- Businesses: Users can only access their own businesses
create policy "Users can view their own businesses"
  on public.businesses for select
  using (auth.uid() = user_id);

create policy "Users can create their own businesses"
  on public.businesses for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own businesses"
  on public.businesses for update
  using (auth.uid() = user_id);

create policy "Users can delete their own businesses"
  on public.businesses for delete
  using (auth.uid() = user_id);

-- WhatsApp Numbers: Access through business ownership
create policy "Users can view their whatsapp numbers"
  on public.whatsapp_numbers for select
  using (exists (
    select 1 from public.businesses
    where businesses.id = whatsapp_numbers.business_id
    and businesses.user_id = auth.uid()
  ));

create policy "Users can manage their whatsapp numbers"
  on public.whatsapp_numbers for all
  using (exists (
    select 1 from public.businesses
    where businesses.id = whatsapp_numbers.business_id
    and businesses.user_id = auth.uid()
  ));

-- Bots: Everyone can read (marketplace)
create policy "Anyone can view bots"
  on public.bots for select
  to authenticated
  using (true);

-- Bot Configs: Access through business ownership
create policy "Users can view their bot configs"
  on public.bot_configs for select
  using (exists (
    select 1 from public.businesses
    where businesses.id = bot_configs.business_id
    and businesses.user_id = auth.uid()
  ));

create policy "Users can manage their bot configs"
  on public.bot_configs for all
  using (exists (
    select 1 from public.businesses
    where businesses.id = bot_configs.business_id
    and businesses.user_id = auth.uid()
  ));

-- Messages: Access through business ownership
create policy "Users can view their messages"
  on public.messages for select
  using (exists (
    select 1 from public.businesses
    where businesses.id = messages.business_id
    and businesses.user_id = auth.uid()
  ));

create policy "Users can manage their messages"
  on public.messages for all
  using (exists (
    select 1 from public.businesses
    where businesses.id = messages.business_id
    and businesses.user_id = auth.uid()
  ));

-- Orders: Access through business ownership
create policy "Users can view their orders"
  on public.orders for select
  using (exists (
    select 1 from public.businesses
    where businesses.id = orders.business_id
    and businesses.user_id = auth.uid()
  ));

create policy "Users can manage their orders"
  on public.orders for all
  using (exists (
    select 1 from public.businesses
    where businesses.id = orders.business_id
    and businesses.user_id = auth.uid()
  ));

-- Appointments: Access through business ownership
create policy "Users can view their appointments"
  on public.appointments for select
  using (exists (
    select 1 from public.businesses
    where businesses.id = appointments.business_id
    and businesses.user_id = auth.uid()
  ));

create policy "Users can manage their appointments"
  on public.appointments for all
  using (exists (
    select 1 from public.businesses
    where businesses.id = appointments.business_id
    and businesses.user_id = auth.uid()
  ));

-- AI Settings: Access through business ownership
create policy "Users can view their ai settings"
  on public.ai_settings for select
  using (exists (
    select 1 from public.businesses
    where businesses.id = ai_settings.business_id
    and businesses.user_id = auth.uid()
  ));

create policy "Users can manage their ai settings"
  on public.ai_settings for all
  using (exists (
    select 1 from public.businesses
    where businesses.id = ai_settings.business_id
    and businesses.user_id = auth.uid()
  ));

-- 7. INSERT DEFAULT BOTS
insert into public.bots (name, type, description, use_case, features, example_replies, icon) values
(
  'Restaurant Bot',
  'restaurant',
  'Perfect for restaurants, cafes, and food delivery services',
  'Handle menu inquiries, take orders, manage reservations',
  '["Menu display", "Order taking", "Reservation booking", "Delivery tracking"]',
  '["Welcome! Would you like to see our menu or place an order?", "Great choice! Your order has been confirmed. Estimated delivery: 30 mins", "We have tables available at 7 PM and 8 PM. Which works for you?"]',
  'Utensils'
),
(
  'Beauty Salon Bot',
  'salon',
  'Ideal for salons, spas, and beauty services',
  'Book appointments, show services, send reminders',
  '["Appointment booking", "Service catalog", "Reminders", "Stylist selection"]',
  '["Hi! Ready to book your next appointment? Here are our available slots.", "Your haircut appointment is confirmed for Saturday at 2 PM!", "Reminder: Your spa session is tomorrow at 10 AM. See you then!"]',
  'Scissors'
),
(
  'E-commerce Bot',
  'ecommerce',
  'Built for online stores and product-based businesses',
  'Product inquiries, order status, returns',
  '["Product search", "Order tracking", "Returns handling", "Cart reminders"]',
  '["Looking for something specific? I can help you find the perfect product!", "Your order #12345 has been shipped! Track it here: [link]", "No problem! I''ll start the return process for you. Please share the order number."]',
  'ShoppingBag'
),
(
  'Generic FAQ Bot',
  'faq',
  'Universal bot for any business type',
  'Answer common questions, provide information',
  '["Custom FAQ", "Business info", "Contact routing", "Working hours"]',
  '["Hi there! How can I help you today?", "Our business hours are Mon-Fri, 9 AM to 6 PM.", "You can reach us at support@example.com for detailed inquiries."]',
  'HelpCircle'
);

-- 8. CREATE FUNCTION TO AUTO-CREATE BUSINESS ON SIGNUP
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.businesses (user_id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'business_name', 'My Business'));
  return new;
end;
$$ language plpgsql security definer;

-- 9. CREATE TRIGGER FOR AUTO-CREATING BUSINESS
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 10. CREATE FUNCTION TO AUTO-CREATE BOT_CONFIG AND AI_SETTINGS FOR NEW BUSINESS
create or replace function public.handle_new_business()
returns trigger as $$
begin
  insert into public.bot_configs (business_id)
  values (new.id);
  
  insert into public.ai_settings (business_id)
  values (new.id);
  
  return new;
end;
$$ language plpgsql security definer;

create trigger on_business_created
  after insert on public.businesses
  for each row execute procedure public.handle_new_business();

-- 11. UPDATED_AT TRIGGER FUNCTION
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply updated_at trigger to relevant tables
create trigger set_updated_at
  before update on public.businesses
  for each row execute procedure public.handle_updated_at();

create trigger set_updated_at
  before update on public.whatsapp_numbers
  for each row execute procedure public.handle_updated_at();

create trigger set_updated_at
  before update on public.bot_configs
  for each row execute procedure public.handle_updated_at();

create trigger set_updated_at
  before update on public.orders
  for each row execute procedure public.handle_updated_at();

create trigger set_updated_at
  before update on public.appointments
  for each row execute procedure public.handle_updated_at();

create trigger set_updated_at
  before update on public.ai_settings
  for each row execute procedure public.handle_updated_at();

-- =============================================
-- DONE! Your schema is ready.
-- Remember to set your Supabase URL and Anon Key 
-- in the frontend code.
-- =============================================
