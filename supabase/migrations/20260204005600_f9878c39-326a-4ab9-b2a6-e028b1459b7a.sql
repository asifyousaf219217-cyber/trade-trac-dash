-- Add list control fields to booking_steps
ALTER TABLE public.booking_steps 
ADD COLUMN IF NOT EXISTS list_source TEXT DEFAULT 'custom',
ADD COLUMN IF NOT EXISTS list_items JSONB DEFAULT '[]'::jsonb;