import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useBusiness } from './useBusiness';
import type { InteractiveMenu, MenuButton } from '@/types/bot-config';
import type { MarketplaceBot } from '@/data/bot-templates';
import { TEMPLATE_REGISTRY, type TemplateDefinition } from '@/data/template-definitions';

export function useInteractiveMenus() {
  const { data: business } = useBusiness();

  return useQuery({
    queryKey: ['interactive_menus', business?.id],
    queryFn: async () => {
      if (!business?.id) return [];

      const { data, error } = await supabase
        .from('interactive_menus')
        .select(`
          *,
          buttons:menu_buttons!menu_buttons_menu_id_fkey(*)
        `)
        .eq('business_id', business.id)
        .order('created_at');

      if (error) throw error;
      
      // Sort buttons by button_order
      return (data || []).map(menu => ({
        ...menu,
        buttons: (menu.buttons || []).sort((a: MenuButton, b: MenuButton) => a.button_order - b.button_order)
      })) as InteractiveMenu[];
    },
    enabled: !!business?.id,
  });
}

export function useCreateMenu() {
  const queryClient = useQueryClient();
  const { data: business, isLoading: businessLoading } = useBusiness();

  return useMutation({
    mutationFn: async (menu: Partial<InteractiveMenu>) => {
      if (businessLoading) {
        throw new Error('Loading business data...');
      }
      if (!business?.id) {
        throw new Error('No business found. Please refresh the page.');
      }

      // Get existing menus to generate unique name
      const { data: existingMenus } = await supabase
        .from('interactive_menus')
        .select('menu_name')
        .eq('business_id', business.id);

      // Generate unique menu name
      let menuName = menu.menu_name || 'New Menu';
      if (existingMenus) {
        const existingNames = new Set(existingMenus.map(m => m.menu_name));
        let counter = 1;
        let baseName = menuName;
        while (existingNames.has(menuName)) {
          counter++;
          menuName = `${baseName} ${counter}`;
        }
      }

      const { data, error } = await supabase
        .from('interactive_menus')
        .insert({
          business_id: business.id,
          menu_name: menuName,
          message_text: menu.message_text || 'Choose an option:',
          is_entry_point: menu.is_entry_point || false,
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error creating menu:', error);
        throw new Error(error.message);
      }
      return data as InteractiveMenu;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interactive_menus'] });
    },
  });
}

export function useUpdateMenu() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<InteractiveMenu> }) => {
      const { data, error } = await supabase
        .from('interactive_menus')
        .update({
          menu_name: updates.menu_name,
          message_text: updates.message_text,
          is_entry_point: updates.is_entry_point,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as InteractiveMenu;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interactive_menus'] });
    },
  });
}

export function useDeleteMenu() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (menuId: string) => {
      // First delete all buttons for this menu
      await supabase
        .from('menu_buttons')
        .delete()
        .eq('menu_id', menuId);

      const { error } = await supabase
        .from('interactive_menus')
        .delete()
        .eq('id', menuId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interactive_menus'] });
    },
  });
}

export function useCreateButton() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (button: Omit<MenuButton, 'id'>) => {
      const { data, error } = await supabase
        .from('menu_buttons')
        .insert({
          menu_id: button.menu_id,
          button_order: button.button_order,
          button_label: button.button_label,
          button_id: button.button_id,
          action_type: button.action_type,
          next_menu_id: button.next_menu_id || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data as MenuButton;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interactive_menus'] });
    },
  });
}

export function useUpdateButton() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<MenuButton> }) => {
      const { data, error } = await supabase
        .from('menu_buttons')
        .update({
          button_order: updates.button_order,
          button_label: updates.button_label,
          button_id: updates.button_id,
          action_type: updates.action_type,
          next_menu_id: updates.next_menu_id || null,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as MenuButton;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interactive_menus'] });
    },
  });
}

export function useDeleteButton() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (buttonId: string) => {
      const { error } = await supabase
        .from('menu_buttons')
        .delete()
        .eq('id', buttonId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interactive_menus'] });
    },
  });
}

// Utility function to set entry point (clears others first)
export function useSetEntryPoint() {
  const queryClient = useQueryClient();
  const { data: business } = useBusiness();

  return useMutation({
    mutationFn: async (menuId: string) => {
      if (!business?.id) throw new Error('No business found');

      // Clear all entry points first
      await supabase
        .from('interactive_menus')
        .update({ is_entry_point: false })
        .eq('business_id', business.id);

      // Set the new entry point
      const { error } = await supabase
        .from('interactive_menus')
        .update({ is_entry_point: true })
        .eq('id', menuId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interactive_menus'] });
    },
  });
}

// Apply template defaults - COMPLETE TEMPLATE ISOLATION
export function useApplyTemplateDefaults() {
  const queryClient = useQueryClient();
  const { data: business } = useBusiness();

  return useMutation({
    mutationFn: async (templateId: string) => {
      if (!business?.id) throw new Error('No business found');
      
      const template = TEMPLATE_REGISTRY[templateId];
      if (!template) throw new Error(`Unknown template: ${templateId}`);

      // ══════════════════════════════════════════════════════════
      // STEP 1: DELETE ALL EXISTING DATA (Full Reset)
      // ══════════════════════════════════════════════════════════
      
      // Delete menu buttons first (foreign key constraint)
      const { data: existingMenus } = await supabase
        .from('interactive_menus')
        .select('id')
        .eq('business_id', business.id);
      
      if (existingMenus) {
        for (const menu of existingMenus) {
          await supabase.from('menu_buttons').delete().eq('menu_id', menu.id);
        }
      }
      
      // Delete menus
      await supabase.from('interactive_menus').delete().eq('business_id', business.id);
      
      // Delete booking steps
      await supabase.from('booking_steps').delete().eq('business_id', business.id);

      // ══════════════════════════════════════════════════════════
      // STEP 2: UPDATE BOT CONFIG (ALL fields from template - FULL OVERWRITE)
      // ══════════════════════════════════════════════════════════
      
      await supabase
        .from('bot_configs')
        .upsert({
          business_id: business.id,
          greeting_message: template.greeting_message,
          fallback_message: template.fallback_message,
          unknown_message_help: template.unknown_message_help,
          appointment_enabled: template.appointment_enabled,
          order_enabled: template.order_enabled,
          // CRITICAL: Include static_replies (FAQs) from template
          static_replies: template.static_replies,
          // NEW: FAQ welcome message for when user taps FAQ button
          faq_welcome_message: template.faq_welcome_message,
          selected_template: template.id,
          // NEW: Template tracking fields
          active_template_id: template.id,
          template_applied_at: new Date().toISOString(),
          is_active: true,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'business_id' });

      // ══════════════════════════════════════════════════════════
      // STEP 3: CREATE MENUS (with proper linking)
      // ══════════════════════════════════════════════════════════
      
      const menuIdMap: Record<string, string> = {};
      
      // First pass: create all menus
      for (const menuDef of template.menus) {
        const { data: menu } = await supabase
          .from('interactive_menus')
          .insert({
            business_id: business.id,
            menu_name: menuDef.menu_name,
            message_text: menuDef.message_text,
            is_entry_point: menuDef.is_entry_point,
          })
          .select()
          .single();
        
        if (menu) {
          menuIdMap[menuDef.menu_name] = menu.id;
        }
      }
      
      // Second pass: create buttons with proper next_menu_id links
      for (const menuDef of template.menus) {
        const menuId = menuIdMap[menuDef.menu_name];
        if (!menuId) continue;
        
        const buttons = menuDef.buttons.map(btn => ({
          menu_id: menuId,
          button_order: btn.button_order,
          button_label: btn.button_label,
          button_id: btn.button_id,
          action_type: btn.action_type,
          next_menu_id: btn.links_to_menu ? menuIdMap[btn.links_to_menu] : null,
        }));
        
        await supabase.from('menu_buttons').insert(buttons);
      }

      // ══════════════════════════════════════════════════════════
      // STEP 4: CREATE BOOKING STEPS (if appointment-based, with new input_type fields)
      // ══════════════════════════════════════════════════════════
      
      if (template.booking_steps && template.booking_steps.length > 0) {
        const steps = template.booking_steps.map(step => ({
          business_id: business.id,
          step_order: step.step_order,
          step_type: step.step_type,
          prompt_text: step.prompt_text,
          validation_type: step.validation_type,
          // Interactive input fields
          input_type: step.input_type || 'TEXT',
          expected_values: step.expected_values || [],
          validation_regex: step.validation_regex || null,
          retry_message: step.retry_message || null,
          is_required: step.is_required ?? true,
          is_enabled: true,
          // CRITICAL FIX: Copy list items on template apply for dashboard visibility
          list_source: step.input_type === 'LIST' || step.input_type === 'BUTTON' ? 'template_default' : 'custom',
          list_items: step.expected_values || [],
        }));
        
        await supabase.from('booking_steps').insert(steps);
      }

      return { templateId, success: true };
    },
    
    onSuccess: () => {
      // Invalidate ALL relevant queries
      queryClient.invalidateQueries({ queryKey: ['interactive_menus'] });
      queryClient.invalidateQueries({ queryKey: ['booking_steps'] });
      queryClient.invalidateQueries({ queryKey: ['bot_config'] });
    },
  });
}

// Apply marketplace template
export function useApplyMarketplaceTemplate() {
  const queryClient = useQueryClient();
  const { data: business } = useBusiness();

  return useMutation({
    mutationFn: async (marketplaceBot: MarketplaceBot) => {
      if (!business?.id) throw new Error('No business found');

      // Delete existing menus
      const { data: existingMenus } = await supabase
        .from('interactive_menus')
        .select('id')
        .eq('business_id', business.id);

      if (existingMenus) {
        for (const menu of existingMenus) {
          await supabase.from('menu_buttons').delete().eq('menu_id', menu.id);
        }
        await supabase.from('interactive_menus').delete().eq('business_id', business.id);
      }

      // Delete existing steps
      await supabase.from('booking_steps').delete().eq('business_id', business.id);

      // Create menus from template
      let menusCreated = 0;
      const defaultMenus = (marketplaceBot as MarketplaceBot & { defaultMenus?: Array<{
        menu_name: string;
        message_text: string;
        is_entry_point?: boolean;
        buttons?: Array<{
          button_order: number;
          button_label: string;
          button_id: string;
          action_type: string;
        }>;
      }> }).defaultMenus;

      if (defaultMenus) {
        for (const menuConfig of defaultMenus) {
          const { data: menu, error } = await supabase
            .from('interactive_menus')
            .insert({
              business_id: business.id,
              menu_name: menuConfig.menu_name,
              message_text: menuConfig.message_text,
              is_entry_point: menuConfig.is_entry_point || false,
            })
            .select()
            .single();

          if (error) throw error;
          menusCreated++;

          // Create buttons
          if (menu && menuConfig.buttons) {
            await supabase.from('menu_buttons').insert(
              menuConfig.buttons.map(btn => ({
                menu_id: menu.id,
                button_order: btn.button_order,
                button_label: btn.button_label,
                button_id: btn.button_id,
                action_type: btn.action_type,
                next_menu_id: null,
              }))
            );
          }
        }
      }

      // Create steps from template
      let stepsCreated = 0;
      const defaultSteps = (marketplaceBot as MarketplaceBot & { defaultSteps?: Array<{
        step_order: number;
        step_type: string;
        prompt_text: string;
        validation_type?: string;
        is_required?: boolean;
        is_enabled?: boolean;
        input_type?: 'TEXT' | 'BUTTON' | 'LIST';
        expected_values?: string[];
      }> }).defaultSteps;

      if (defaultSteps) {
        await supabase.from('booking_steps').insert(
          defaultSteps.map(step => ({
            business_id: business.id,
            step_order: step.step_order,
            step_type: step.step_type,
            prompt_text: step.prompt_text,
            validation_type: step.validation_type || 'text',
            is_required: step.is_required ?? true,
            is_enabled: step.is_enabled ?? true,
            // CRITICAL FIX: Include interactive fields for marketplace templates
            input_type: step.input_type || 'TEXT',
            expected_values: step.expected_values || [],
            list_source: step.input_type === 'LIST' || step.input_type === 'BUTTON' ? 'template_default' : 'custom',
            list_items: step.expected_values || [],
          }))
        );
        stepsCreated = defaultSteps.length;
      }

      return { menusCreated, stepsCreated };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interactive_menus'] });
      queryClient.invalidateQueries({ queryKey: ['booking_steps'] });
    },
  });
}