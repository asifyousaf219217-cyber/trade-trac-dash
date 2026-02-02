-- Enable RLS on interactive_menus
ALTER TABLE public.interactive_menus ENABLE ROW LEVEL SECURITY;

-- Policies for interactive_menus
CREATE POLICY "Users can view own interactive_menus" 
ON public.interactive_menus 
FOR SELECT 
USING (business_id = get_user_business_id(auth.uid()));

CREATE POLICY "Users can create own interactive_menus" 
ON public.interactive_menus 
FOR INSERT 
WITH CHECK (business_id = get_user_business_id(auth.uid()));

CREATE POLICY "Users can update own interactive_menus" 
ON public.interactive_menus 
FOR UPDATE 
USING (business_id = get_user_business_id(auth.uid()));

CREATE POLICY "Users can delete own interactive_menus" 
ON public.interactive_menus 
FOR DELETE 
USING (business_id = get_user_business_id(auth.uid()));

-- Enable RLS on menu_buttons
ALTER TABLE public.menu_buttons ENABLE ROW LEVEL SECURITY;

-- Policies for menu_buttons (access via menu ownership)
CREATE POLICY "Users can view own menu_buttons" 
ON public.menu_buttons 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.interactive_menus im 
    WHERE im.id = menu_id 
    AND im.business_id = get_user_business_id(auth.uid())
  )
);

CREATE POLICY "Users can create own menu_buttons" 
ON public.menu_buttons 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.interactive_menus im 
    WHERE im.id = menu_id 
    AND im.business_id = get_user_business_id(auth.uid())
  )
);

CREATE POLICY "Users can update own menu_buttons" 
ON public.menu_buttons 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.interactive_menus im 
    WHERE im.id = menu_id 
    AND im.business_id = get_user_business_id(auth.uid())
  )
);

CREATE POLICY "Users can delete own menu_buttons" 
ON public.menu_buttons 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.interactive_menus im 
    WHERE im.id = menu_id 
    AND im.business_id = get_user_business_id(auth.uid())
  )
);

-- Enable RLS on booking_steps
ALTER TABLE public.booking_steps ENABLE ROW LEVEL SECURITY;

-- Policies for booking_steps
CREATE POLICY "Users can view own booking_steps" 
ON public.booking_steps 
FOR SELECT 
USING (business_id = get_user_business_id(auth.uid()));

CREATE POLICY "Users can create own booking_steps" 
ON public.booking_steps 
FOR INSERT 
WITH CHECK (business_id = get_user_business_id(auth.uid()));

CREATE POLICY "Users can update own booking_steps" 
ON public.booking_steps 
FOR UPDATE 
USING (business_id = get_user_business_id(auth.uid()));

CREATE POLICY "Users can delete own booking_steps" 
ON public.booking_steps 
FOR DELETE 
USING (business_id = get_user_business_id(auth.uid()));