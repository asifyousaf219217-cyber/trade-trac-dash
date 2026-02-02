-- Fix function search path for update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix function search path for handle_new_business
CREATE OR REPLACE FUNCTION public.handle_new_business()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;