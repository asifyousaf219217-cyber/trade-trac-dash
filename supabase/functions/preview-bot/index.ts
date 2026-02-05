import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PreviewRequest {
  business_id: string;
  message_text: string;
  button_payload?: string;
  current_state?: string;
  current_context?: Record<string, unknown>;
}

interface Button {
  button_id: string;
  button_label: string;
  action_type: string;
  next_menu_id?: string;
  menu_id?: string;
}

interface Menu {
  id: string;
  message_text: string;
  menu_buttons?: Button[];
}

interface BookingStep {
  prompt_text: string;
  input_type?: string;
  expected_values?: string[];
}

interface BotConfig {
  greeting_message?: string;
  faq_welcome_message?: string;
  unknown_message_help?: string;
  static_replies?: Array<{ keywords?: string[]; reply: string }>;
  appointment_prompts?: { service_prompt?: string };
}

interface FullData {
  conversation_state?: string;
  message_text?: string;
  button_payload?: string;
  bot_config?: BotConfig;
  entry_menu?: Menu | null;
  menu_buttons?: Button[];
  all_buttons?: Button[];
  all_menus?: Menu[];
  booking_steps?: BookingStep[];
  context?: Record<string, unknown>;
}

// State Router logic (same as n8n Node 18)
function runStateRouter(fullData: FullData) {
  const state = fullData.conversation_state || 'NEW';
  const msg = (fullData.message_text || '').toLowerCase().trim();
  const buttonPayload = fullData.button_payload;
  const botConfig = fullData.bot_config || {};
  const entryMenu = fullData.entry_menu;
  const menuButtons = fullData.menu_buttons || [];
  const allButtons = fullData.all_buttons || [];
  const allMenus = fullData.all_menus || [];
  const bookingSteps = fullData.booking_steps || [];
  const context = fullData.context || {};

  // Helper functions
  function getDynamicButtons() {
    if (menuButtons.length > 0) {
      return menuButtons.slice(0, 3).map((btn) => ({
        id: btn.button_id,
        title: (btn.button_label || '').substring(0, 20)
      }));
    }
    return [
      { id: 'booking', title: '📅 Book' },
      { id: 'faq', title: '❓ FAQ' },
      { id: 'human', title: '💬 Support' }
    ];
  }

  function getGreeting() {
    if (entryMenu?.message_text) return entryMenu.message_text;
    return botConfig.greeting_message || "👋 Welcome! How can I help you?";
  }

  function getMenuById(menuId: string) {
    return allMenus.find((m) => m.id === menuId) || null;
  }

  function getButtonsForMenu(menuId: string) {
    return allButtons.filter((b) => b.menu_id === menuId).slice(0, 3).map((btn) => ({
      id: btn.button_id,
      title: (btn.button_label || '').substring(0, 20)
    }));
  }

  // Menu triggers
  const MENU_TEXT_TRIGGERS = ['menu', 'help', 'start', 'home', 'hi', 'hello', 'hey'];
  const isMenuText = MENU_TEXT_TRIGGERS.includes(msg);

  // Handle button clicks
  const clickedBtn = allButtons.find((b) => b.button_id === buttonPayload) || 
                     menuButtons.find((b) => b.button_id === buttonPayload);

  if (clickedBtn) {
    if (clickedBtn.action_type === 'OPEN_MENU' && clickedBtn.next_menu_id) {
      const targetMenu = getMenuById(clickedBtn.next_menu_id);
      const targetButtons = getButtonsForMenu(clickedBtn.next_menu_id);
      
      if (targetMenu && targetButtons.length > 0) {
        return {
          reply_text: targetMenu.message_text || "Choose an option:",
          reply_type: 'interactive',
          interactive_buttons: targetButtons,
          new_state: 'AWAITING_INTENT',
          new_context: { current_menu_id: clickedBtn.next_menu_id }
        };
      }
    }

    if (clickedBtn.action_type === 'START_BOOKING') {
      if (bookingSteps.length > 0) {
        const firstStep = bookingSteps[0];
        const expectedValues = firstStep.expected_values || [];
        const inputType = firstStep.input_type || 'TEXT';
        
        return {
          reply_text: firstStep.prompt_text,
          reply_type: inputType === 'TEXT' ? 'text' : 'interactive',
          interactive_buttons: inputType !== 'TEXT' ? expectedValues.slice(0, 3).map((v, i) => ({
            id: `step_option_${i}`,
            title: v.substring(0, 20)
          })) : undefined,
          new_state: 'BOOKING_STEP',
          new_context: { intent: 'booking', step_index: 0, attempts: 0 }
        };
      }
      return {
        reply_text: botConfig.appointment_prompts?.service_prompt || "What service would you like to book?",
        reply_type: 'text',
        new_state: 'BOOKING_SERVICE',
        new_context: { intent: 'booking', attempts: 0 }
      };
    }

    if (clickedBtn.action_type === 'START_ORDER') {
      return {
        reply_text: "🍽️ What would you like to order?",
        reply_type: 'text',
        new_state: 'ORDER_START',
        new_context: { intent: 'order', attempts: 0 }
      };
    }

    if (clickedBtn.action_type === 'FAQ') {
      return {
        reply_text: botConfig.faq_welcome_message || "💬 What can I help you with?\n\nTry asking about:\n• Hours\n• Prices\n• Location",
        reply_type: 'text',
        new_state: 'FAQ',
        new_context: { intent: 'faq' }
      };
    }

    if (clickedBtn.action_type === 'HUMAN') {
      return {
        reply_text: "🙋 A team member will respond shortly.\n\nType 'menu' to return.",
        reply_type: 'text',
        new_state: 'HUMAN_REVIEW',
        new_context: { intent: 'human_review' }
      };
    }

    if (clickedBtn.action_type === 'CANCEL_APPOINTMENT') {
      return {
        reply_text: "📋 Looking for your active appointments...",
        reply_type: 'text',
        new_state: 'CANCEL_APPOINTMENT_CHECK',
        new_context: { intent: 'cancel_appointment' }
      };
    }

    if (clickedBtn.action_type === 'CANCEL_ORDER') {
      return {
        reply_text: "📦 Looking for your active orders...",
        reply_type: 'text',
        new_state: 'CANCEL_ORDER_CHECK',
        new_context: { intent: 'cancel_order' }
      };
    }
  }

  // Handle booking step progression
  if (state === 'BOOKING_STEP') {
    const stepIndex = (context.step_index as number) || 0;
    const nextIndex = stepIndex + 1;
    
    if (nextIndex < bookingSteps.length) {
      const nextStep = bookingSteps[nextIndex];
      const expectedValues = nextStep.expected_values || [];
      const inputType = nextStep.input_type || 'TEXT';
      
      return {
        reply_text: nextStep.prompt_text,
        reply_type: inputType === 'TEXT' ? 'text' : 'interactive',
        interactive_buttons: inputType !== 'TEXT' ? expectedValues.slice(0, 3).map((v, i) => ({
          id: `step_option_${i}`,
          title: v.substring(0, 20)
        })) : undefined,
        new_state: 'BOOKING_STEP',
        new_context: { ...context, step_index: nextIndex }
      };
    } else {
      // Booking complete
      return {
        reply_text: "✅ *Booking Confirmed!*\n\nThank you for your booking. We'll send you a confirmation shortly.",
        reply_type: 'interactive',
        interactive_buttons: getDynamicButtons(),
        new_state: 'AWAITING_INTENT',
        new_context: { attempts: 0 }
      };
    }
  }

  // NEW state or menu trigger
  if (state === 'NEW' || isMenuText) {
    return {
      reply_text: getGreeting(),
      reply_type: 'interactive',
      interactive_buttons: getDynamicButtons(),
      new_state: 'AWAITING_INTENT',
      new_context: { attempts: 0 }
    };
  }

  // FAQ state
  if (state === 'FAQ') {
    const staticReplies = botConfig.static_replies || [];
    for (const item of staticReplies) {
      if ((item.keywords || []).some((k: string) => msg.includes(k.toLowerCase()))) {
        return {
          reply_text: item.reply + "\n\nAnything else? Type 'menu' for options.",
          reply_type: 'text',
          new_state: 'FAQ',
          new_context: { intent: 'faq' }
        };
      }
    }
    return {
      reply_text: botConfig.unknown_message_help || "I'm not sure. Type 'menu' for options.",
      reply_type: 'text',
      new_state: 'FAQ',
      new_context: {}
    };
  }

  // Default: show menu
  return {
    reply_text: getGreeting(),
    reply_type: 'interactive',
    interactive_buttons: getDynamicButtons(),
    new_state: 'AWAITING_INTENT',
    new_context: { attempts: 0 }
  };
}

// Fallback for businesses without WhatsApp number yet
async function getPreviewDataDirect(
  // deno-lint-ignore no-explicit-any
  supabase: any, 
  businessId: string, 
  messageText: string, 
  buttonPayload: string | undefined, 
  currentState: string | undefined, 
  currentContext: Record<string, unknown> | undefined
): Promise<Response> {
  const [
    { data: botConfig },
    { data: entryMenu },
    { data: allMenus },
    { data: bookingSteps }
  ] = await Promise.all([
    supabase.from('bot_configs').select('*').eq('business_id', businessId).single(),
    supabase.from('interactive_menus').select('*, menu_buttons(*)').eq('business_id', businessId).eq('is_entry_point', true).single(),
    supabase.from('interactive_menus').select('*, menu_buttons(*)').eq('business_id', businessId),
    supabase.from('booking_steps').select('*').eq('business_id', businessId).eq('is_enabled', true).order('step_order')
  ]);

  const entryMenuTyped = entryMenu as Menu | null;
  const allMenusTyped = (allMenus || []) as Menu[];

  const previewData: FullData = {
    bot_config: (botConfig || {}) as BotConfig,
    entry_menu: entryMenuTyped,
    all_menus: allMenusTyped,
    all_buttons: allMenusTyped.flatMap((m) => m.menu_buttons || []),
    menu_buttons: entryMenuTyped?.menu_buttons || [],
    booking_steps: (bookingSteps || []) as BookingStep[],
    conversation_state: currentState || 'NEW',
    context: currentContext || {},
    message_text: messageText,
    button_payload: buttonPayload
  };

  const routerResponse = runStateRouter(previewData);
  
  return new Response(JSON.stringify(routerResponse), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { business_id, message_text, button_payload, current_state, current_context } = 
      await req.json() as PreviewRequest;

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get phone_number_id for this business (to use same RPC)
    const { data: whatsappNumber } = await supabase
      .from('whatsapp_numbers')
      .select('phone_number_id')
      .eq('business_id', business_id)
      .single();

    if (!whatsappNumber?.phone_number_id) {
      // Fallback: fetch data directly if no WhatsApp number configured
      return await getPreviewDataDirect(supabase, business_id, message_text, button_payload, current_state, current_context);
    }

    // Call the SAME RPC that n8n uses
    const { data: rpcData, error } = await supabase.rpc('get_bot_data_fast', {
      p_phone_number_id: whatsappNumber.phone_number_id,
      p_from_number: 'preview_simulator',
      p_whatsapp_message_id: `preview_${Date.now()}_${Math.random().toString(36).slice(2)}`
    });

    if (error) throw error;

    // Override state/context for preview simulation
    const previewData: FullData = {
      ...(rpcData as Record<string, unknown>),
      conversation_state: current_state || 'NEW',
      context: current_context || {},
      message_text: message_text,
      button_payload: button_payload
    };

    // Run State Router logic (same as n8n Node 18)
    const routerResponse = runStateRouter(previewData);

    return new Response(JSON.stringify(routerResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err: unknown) {
    console.error('Preview bot error:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
