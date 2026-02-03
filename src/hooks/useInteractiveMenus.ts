import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useBusiness } from './useBusiness';
import type { InteractiveMenu, MenuButton } from '@/types/bot-config';
import type { MarketplaceBot } from '@/data/bot-templates';

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

// Apply template defaults
export function useApplyTemplateDefaults() {
  const queryClient = useQueryClient();
  const { data: business } = useBusiness();

  return useMutation({
    mutationFn: async (template: 'appointment' | 'order' | 'class_booking') => {
      if (!business?.id) throw new Error('No business found');

      // Delete existing menus and buttons
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

      // Delete existing booking steps
      await supabase.from('booking_steps').delete().eq('business_id', business.id);

      // Create template-specific menus
      if (template === 'appointment') {
        // Create Main Menu
        const { data: mainMenu } = await supabase
          .from('interactive_menus')
          .insert({
            business_id: business.id,
            menu_name: 'Main Menu',
            message_text: 'Welcome! How can I help you today?',
            is_entry_point: true,
          })
          .select()
          .single();

        // Create Appointments Sub-Menu
        const { data: apptMenu } = await supabase
          .from('interactive_menus')
          .insert({
            business_id: business.id,
            menu_name: 'Appointments',
            message_text: 'What would you like to do?',
            is_entry_point: false,
          })
          .select()
          .single();

        if (mainMenu && apptMenu) {
          // Main Menu buttons
          await supabase.from('menu_buttons').insert([
            { menu_id: mainMenu.id, button_order: 1, button_label: '📅 Appointments', button_id: 'appointments', action_type: 'OPEN_MENU', next_menu_id: apptMenu.id },
            { menu_id: mainMenu.id, button_order: 2, button_label: '❓ FAQ', button_id: 'faq', action_type: 'FAQ' },
            { menu_id: mainMenu.id, button_order: 3, button_label: '💬 Support', button_id: 'human', action_type: 'HUMAN' },
          ]);

          // Appointments Sub-Menu buttons
          await supabase.from('menu_buttons').insert([
            { menu_id: apptMenu.id, button_order: 1, button_label: '📅 Book', button_id: 'booking', action_type: 'START_BOOKING' },
            { menu_id: apptMenu.id, button_order: 2, button_label: '❌ Cancel', button_id: 'cancel_appointment', action_type: 'CANCEL_APPOINTMENT' },
            { menu_id: apptMenu.id, button_order: 3, button_label: '⬅ Back', button_id: 'back_main', action_type: 'OPEN_MENU', next_menu_id: mainMenu.id },
          ]);
        }

        // Enable appointments in bot_configs
        await supabase
          .from('bot_configs')
          .upsert({
            business_id: business.id,
            appointment_enabled: true,
          }, { onConflict: 'business_id' });

        // Create booking steps
        await supabase.from('booking_steps').insert([
          { business_id: business.id, step_order: 1, step_type: 'SERVICE', prompt_text: 'What service would you like to book?', validation_type: 'service_match', is_required: true, is_enabled: true },
          { business_id: business.id, step_order: 2, step_type: 'DATETIME', prompt_text: 'What date and time work for you?', validation_type: 'datetime', is_required: true, is_enabled: true },
          { business_id: business.id, step_order: 3, step_type: 'NAME', prompt_text: 'What is your name?', validation_type: 'text', is_required: true, is_enabled: true },
        ]);

      } else if (template === 'order') {
        // Create Main Menu
        const { data: mainMenu } = await supabase
          .from('interactive_menus')
          .insert({
            business_id: business.id,
            menu_name: 'Main Menu',
            message_text: 'Welcome! What would you like to do?',
            is_entry_point: true,
          })
          .select()
          .single();

        // Create Orders Sub-Menu
        const { data: ordersMenu } = await supabase
          .from('interactive_menus')
          .insert({
            business_id: business.id,
            menu_name: 'Orders',
            message_text: 'How can I help with your order?',
            is_entry_point: false,
          })
          .select()
          .single();

        if (mainMenu && ordersMenu) {
          // Main Menu buttons
          await supabase.from('menu_buttons').insert([
            { menu_id: mainMenu.id, button_order: 1, button_label: '🛒 Orders', button_id: 'orders', action_type: 'OPEN_MENU', next_menu_id: ordersMenu.id },
            { menu_id: mainMenu.id, button_order: 2, button_label: '📋 View Menu', button_id: 'menu', action_type: 'FAQ' },
            { menu_id: mainMenu.id, button_order: 3, button_label: '💬 Support', button_id: 'human', action_type: 'HUMAN' },
          ]);

          // Orders Sub-Menu buttons
          await supabase.from('menu_buttons').insert([
            { menu_id: ordersMenu.id, button_order: 1, button_label: '🛒 Place Order', button_id: 'order', action_type: 'START_ORDER' },
            { menu_id: ordersMenu.id, button_order: 2, button_label: '❌ Cancel Order', button_id: 'cancel_order', action_type: 'CANCEL_ORDER' },
            { menu_id: ordersMenu.id, button_order: 3, button_label: '⬅ Back', button_id: 'back_main', action_type: 'OPEN_MENU', next_menu_id: mainMenu.id },
          ]);
        }

        // Enable orders in bot_configs
        await supabase
          .from('bot_configs')
          .upsert({
            business_id: business.id,
            order_enabled: true,
          }, { onConflict: 'business_id' });

        // Create order steps
        await supabase.from('booking_steps').insert([
          { business_id: business.id, step_order: 1, step_type: 'CUSTOM', prompt_text: 'What would you like to order?', validation_type: 'text', is_required: true, is_enabled: true },
        ]);

      } else if (template === 'class_booking') {
        // Create Main Menu
        const { data: mainMenu } = await supabase
          .from('interactive_menus')
          .insert({
            business_id: business.id,
            menu_name: 'Main Menu',
            message_text: 'Welcome! How can we help you today?',
            is_entry_point: true,
          })
          .select()
          .single();

        // Create Enrollment Sub-Menu
        const { data: enrollMenu } = await supabase
          .from('interactive_menus')
          .insert({
            business_id: business.id,
            menu_name: 'Enrollment',
            message_text: 'What would you like to do?',
            is_entry_point: false,
          })
          .select()
          .single();

        if (mainMenu && enrollMenu) {
          // Main Menu buttons
          await supabase.from('menu_buttons').insert([
            { menu_id: mainMenu.id, button_order: 1, button_label: '📚 Classes', button_id: 'classes', action_type: 'OPEN_MENU', next_menu_id: enrollMenu.id },
            { menu_id: mainMenu.id, button_order: 2, button_label: '📅 Schedule', button_id: 'schedule', action_type: 'FAQ' },
            { menu_id: mainMenu.id, button_order: 3, button_label: '💬 Support', button_id: 'human', action_type: 'HUMAN' },
          ]);

          // Enrollment Sub-Menu buttons
          await supabase.from('menu_buttons').insert([
            { menu_id: enrollMenu.id, button_order: 1, button_label: '📚 Enroll', button_id: 'enroll', action_type: 'START_BOOKING' },
            { menu_id: enrollMenu.id, button_order: 2, button_label: '❌ Cancel', button_id: 'cancel_enrollment', action_type: 'CANCEL_APPOINTMENT' },
            { menu_id: enrollMenu.id, button_order: 3, button_label: '⬅ Back', button_id: 'back_main', action_type: 'OPEN_MENU', next_menu_id: mainMenu.id },
          ]);
        }

        // Enable appointments in bot_configs (for class bookings)
        await supabase
          .from('bot_configs')
          .upsert({
            business_id: business.id,
            appointment_enabled: true,
          }, { onConflict: 'business_id' });

        // Create enrollment steps
        await supabase.from('booking_steps').insert([
          { business_id: business.id, step_order: 1, step_type: 'CUSTOM', prompt_text: 'Which class would you like to enroll in?', validation_type: 'text', is_required: true, is_enabled: true },
          { business_id: business.id, step_order: 2, step_type: 'DATETIME', prompt_text: 'Select your preferred date:', validation_type: 'datetime', is_required: true, is_enabled: true },
          { business_id: business.id, step_order: 3, step_type: 'NAME', prompt_text: 'Your name:', validation_type: 'text', is_required: true, is_enabled: true },
        ]);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interactive_menus'] });
      queryClient.invalidateQueries({ queryKey: ['booking_steps'] });
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