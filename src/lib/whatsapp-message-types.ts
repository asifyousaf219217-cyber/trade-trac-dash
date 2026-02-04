// WhatsApp Message Types for Interactive Messages

export interface WhatsAppListOption {
  id: string;
  title: string;
  description?: string;  // Max 72 chars
}

export interface WhatsAppListSection {
  title: string;  // Max 24 chars
  rows: WhatsAppListOption[];
}

export interface WhatsAppListMessage {
  type: 'list';
  header?: string;  // Max 60 chars
  body: string;     // Max 1024 chars
  footer?: string;  // Max 60 chars
  button: string;   // Max 20 chars - "View Options"
  sections: WhatsAppListSection[];
}

export interface WhatsAppButtonMessage {
  type: 'button';
  body: string;
  buttons: Array<{
    type: 'reply';
    reply: {
      id: string;
      title: string;  // Max 20 chars
    };
  }>;
}

export interface WhatsAppTextMessage {
  type: 'text';
  body: string;
}

export type WhatsAppInteractivePayload = 
  | { type: 'text'; payload: { body: string } }
  | { type: 'button'; payload: WhatsAppButtonPayload }
  | { type: 'list'; payload: WhatsAppListPayload };

export interface WhatsAppButtonPayload {
  body: { text: string };
  action: {
    buttons: Array<{
      type: 'reply';
      reply: { id: string; title: string };
    }>;
  };
}

export interface WhatsAppListPayload {
  body: { text: string };
  action: {
    button: string;
    sections: Array<{
      title: string;
      rows: Array<{
        id: string;
        title: string;
        description?: string;
      }>;
    }>;
  };
}

/**
 * Auto-detect: ≤3 options → Buttons, >3 options → List
 */
export function getInteractiveType(options: string[]): 'button' | 'list' | 'text' {
  if (!options || options.length === 0) return 'text';
  return options.length <= 3 ? 'button' : 'list';
}

/**
 * Build WhatsApp payload based on option count
 * - 0 options: text message
 * - 1-3 options: button message
 * - 4+ options: list message
 */
export function buildInteractivePayload(
  text: string,
  options: string[],
  buttonLabel: string = 'Select'
): WhatsAppInteractivePayload {
  if (!options || options.length === 0) {
    return { type: 'text', payload: { body: text } };
  }

  if (options.length <= 3) {
    // Button message (max 3 buttons)
    return {
      type: 'button',
      payload: {
        body: { text },
        action: {
          buttons: options.map((opt, i) => ({
            type: 'reply' as const,
            reply: { 
              id: `option_${i}`, 
              title: opt.substring(0, 20)  // WhatsApp limit
            }
          }))
        }
      }
    };
  }

  // List message for >3 options
  return {
    type: 'list',
    payload: {
      body: { text },
      action: {
        button: buttonLabel.substring(0, 20),  // WhatsApp limit
        sections: [{
          title: 'Options',
          rows: options.map((opt, i) => ({
            id: `option_${i}`,
            title: opt.substring(0, 24),  // WhatsApp limit
            description: ''
          }))
        }]
      }
    }
  };
}

/**
 * Format for n8n workflow output
 */
export interface N8nInteractiveOutput {
  reply_type: 'text' | 'interactive' | 'interactive_list';
  reply_text: string;
  interactive_buttons?: Array<{ id: string; title: string }>;
  interactive_list?: {
    button: string;
    sections: Array<{
      title: string;
      rows: Array<{ id: string; title: string; description?: string }>;
    }>;
  };
}

/**
 * Build n8n-compatible payload for workflow integration
 */
export function buildN8nPayload(
  text: string,
  options: string[],
  buttonLabel: string = 'Select'
): N8nInteractiveOutput {
  if (!options || options.length === 0) {
    return { reply_type: 'text', reply_text: text };
  }

  if (options.length <= 3) {
    return {
      reply_type: 'interactive',
      reply_text: text,
      interactive_buttons: options.map((opt, i) => ({
        id: `option_${i}`,
        title: opt.substring(0, 20)
      }))
    };
  }

  return {
    reply_type: 'interactive_list',
    reply_text: text,
    interactive_list: {
      button: buttonLabel.substring(0, 20),
      sections: [{
        title: 'Options',
        rows: options.map((opt, i) => ({
          id: `option_${i}`,
          title: opt.substring(0, 24)
        }))
      }]
    }
  };
}

/**
 * Validate user input against expected values
 * Returns the matched value or null if no match
 */
export function matchUserInput(
  userInput: string,
  expectedValues: string[],
  fuzzyMatch: boolean = true
): string | null {
  if (!expectedValues || expectedValues.length === 0) return userInput;
  
  const normalizedInput = userInput.toLowerCase().trim();
  
  // Exact match first
  const exactMatch = expectedValues.find(
    v => v.toLowerCase() === normalizedInput
  );
  if (exactMatch) return exactMatch;
  
  // Button ID match (option_0, option_1, etc.)
  const idMatch = normalizedInput.match(/^option_(\d+)$/);
  if (idMatch) {
    const index = parseInt(idMatch[1], 10);
    if (index >= 0 && index < expectedValues.length) {
      return expectedValues[index];
    }
  }
  
  if (fuzzyMatch) {
    // Contains match
    const containsMatch = expectedValues.find(
      v => normalizedInput.includes(v.toLowerCase()) || 
           v.toLowerCase().includes(normalizedInput)
    );
    if (containsMatch) return containsMatch;
  }
  
  return null;
}
