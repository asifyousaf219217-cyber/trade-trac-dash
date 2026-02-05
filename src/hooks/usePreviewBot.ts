import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PreviewMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  buttons?: Array<{ id: string; title: string }>;
  listOptions?: string[];
  timestamp: Date;
}

interface PreviewState {
  state: string;
  context: Record<string, unknown>;
}

export function usePreviewBot(businessId: string | null) {
  const [messages, setMessages] = useState<PreviewMessage[]>([]);
  const [previewState, setPreviewState] = useState<PreviewState>({ state: 'NEW', context: {} });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isFirstMessageRef = useRef<boolean>(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const sendMessage = useCallback(async (text: string, buttonPayload?: string) => {
    if (!businessId) {
      setError('No business ID provided');
      return;
    }

    // Cancel any pending request
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    // Add user message
    const userMsg: PreviewMessage = {
      id: `user_${Date.now()}`,
      text: buttonPayload ? `[${text}]` : text,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    setError(null);

    // Track if this is the first message (used to skip duplicate greeting)
    const isFirstMsg = isFirstMessageRef.current;
    isFirstMessageRef.current = false;

    try {
      // Call Edge Function (same backend as production)
      const { data, error: fnError } = await supabase.functions.invoke('preview-bot', {
        body: {
          business_id: businessId,
          message_text: text,
          button_payload: buttonPayload,
          current_state: previewState.state,
          current_context: previewState.context,
          is_first_message: isFirstMsg
        }
      });

      if (fnError) throw fnError;

      if (data.error) {
        throw new Error(data.error);
      }

      // Add bot response
      const botMsg: PreviewMessage = {
        id: `bot_${Date.now()}`,
        text: data.reply_text || 'No response',
        sender: 'bot',
        buttons: data.interactive_buttons,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);

      // Update state
      setPreviewState({
        state: data.new_state || 'NEW',
        context: data.new_context || {}
      });

    } catch (err) {
      console.error('Preview error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      setMessages(prev => [...prev, {
        id: `error_${Date.now()}`,
        text: `⚠️ Preview error: ${errorMessage}`,
        sender: 'bot',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [businessId, previewState]);

  const resetPreview = useCallback(() => {
    abortControllerRef.current?.abort();
    setMessages([]);
    setPreviewState({ state: 'NEW', context: {} });
    setError(null);
    isFirstMessageRef.current = true;
  }, []);

  const startPreview = useCallback(async () => {
    setMessages([]);
    setPreviewState({ state: 'NEW', context: {} });
    setError(null);
    // Small delay to ensure state is reset before sending
    await new Promise(resolve => setTimeout(resolve, 50));
    await sendMessage('hi');
  }, [sendMessage]);

  return { 
    messages, 
    isLoading, 
    error,
    sendMessage, 
    resetPreview, 
    startPreview, 
    previewState 
  };
}
