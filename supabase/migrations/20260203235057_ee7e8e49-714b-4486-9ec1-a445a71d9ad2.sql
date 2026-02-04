-- ═══════════════════════════════════════════════════════════
-- A) CREATE ENUM FOR STEP INPUT TYPE
-- ═══════════════════════════════════════════════════════════
DO $$ BEGIN
  CREATE TYPE public.step_input_type AS ENUM ('BUTTON', 'LIST', 'TEXT');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ═══════════════════════════════════════════════════════════
-- B) ENHANCE booking_steps FOR INTERACTIVE INPUT
-- ═══════════════════════════════════════════════════════════
ALTER TABLE public.booking_steps 
ADD COLUMN IF NOT EXISTS input_type text DEFAULT 'TEXT',
ADD COLUMN IF NOT EXISTS expected_values JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS validation_regex TEXT,
ADD COLUMN IF NOT EXISTS retry_message TEXT,
ADD COLUMN IF NOT EXISTS skip_button_label TEXT;

-- ═══════════════════════════════════════════════════════════
-- C) ADD LIST MESSAGE SUPPORT TO menu_buttons
-- ═══════════════════════════════════════════════════════════
ALTER TABLE public.menu_buttons 
ADD COLUMN IF NOT EXISTS is_list_item BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS list_section_title TEXT;

-- ═══════════════════════════════════════════════════════════
-- D) ADD TEMPLATE TRACKING TO bot_configs
-- ═══════════════════════════════════════════════════════════
ALTER TABLE public.bot_configs 
ADD COLUMN IF NOT EXISTS active_template_id TEXT,
ADD COLUMN IF NOT EXISTS template_applied_at TIMESTAMP WITH TIME ZONE;

-- ═══════════════════════════════════════════════════════════
-- E) INDEXES FOR PERFORMANCE
-- ═══════════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_menu_buttons_menu_id ON public.menu_buttons(menu_id);
CREATE INDEX IF NOT EXISTS idx_booking_steps_business_enabled ON public.booking_steps(business_id, is_enabled);
CREATE INDEX IF NOT EXISTS idx_conversations_business_phone ON public.conversations(business_id, customer_phone);