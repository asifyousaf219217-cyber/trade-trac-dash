import { useState } from 'react';
import { RotateCcw, MessageSquare, User, ChevronLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { InteractiveMenu, MenuButton, BookingStep } from '@/types/bot-config';
import { ACTION_TYPE_LABELS } from '@/types/bot-config';

interface WhatsAppPreviewProps {
  menus: InteractiveMenu[];
  bookingSteps: BookingStep[];
  greeting: string;
}

type PreviewState = 
  | { type: 'menu'; menuId: string }
  | { type: 'booking'; stepIndex: number }
  | { type: 'message'; message: string };

interface ChatMessage {
  from: 'bot' | 'user';
  text: string;
  buttons?: MenuButton[];
}

export function WhatsAppPreview({ menus, bookingSteps, greeting }: WhatsAppPreviewProps) {
  const entryMenu = menus.find(m => m.is_entry_point) || menus[0];
  const [state, setState] = useState<PreviewState | null>(
    entryMenu ? { type: 'menu', menuId: entryMenu.id } : null
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [menuHistory, setMenuHistory] = useState<string[]>([]);

  const currentMenu = state?.type === 'menu' 
    ? menus.find(m => m.id === state.menuId) 
    : null;

  const currentStep = state?.type === 'booking' && bookingSteps[state.stepIndex]
    ? bookingSteps[state.stepIndex]
    : null;

  const handleButtonClick = (button: MenuButton) => {
    // Add user "click" to messages
    setMessages(prev => [...prev, { from: 'user', text: button.button_label }]);

    switch (button.action_type) {
      case 'OPEN_MENU':
        if (button.next_menu_id) {
          const nextMenu = menus.find(m => m.id === button.next_menu_id);
          if (nextMenu) {
            // Save current menu to history before navigating
            if (state?.type === 'menu') {
              setMenuHistory(prev => [...prev, state.menuId]);
            }
            setMessages(prev => [...prev, { 
              from: 'bot', 
              text: nextMenu.message_text,
              buttons: nextMenu.buttons || []
            }]);
            setState({ type: 'menu', menuId: button.next_menu_id });
          }
        }
        break;
      case 'START_BOOKING':
        if (bookingSteps.length > 0) {
          const firstStep = bookingSteps[0];
          setMessages(prev => [...prev, { from: 'bot', text: firstStep.prompt_text }]);
          setState({ type: 'booking', stepIndex: 0 });
        } else {
          setMessages(prev => [...prev, { from: 'bot', text: 'Booking flow started! (No steps configured)' }]);
        }
        break;
      case 'START_ORDER':
        setMessages(prev => [...prev, { from: 'bot', text: 'What would you like to order?' }]);
        setState({ type: 'message', message: 'Order started' });
        break;
      case 'FAQ':
        setMessages(prev => [...prev, { from: 'bot', text: 'Here are our frequently asked questions...' }]);
        break;
      case 'HUMAN':
        setMessages(prev => [...prev, { from: 'bot', text: '🙋 Routing you to a human agent. Please wait...' }]);
        break;
      case 'CANCEL_APPOINTMENT':
        setMessages(prev => [...prev, { from: 'bot', text: 'Looking for your appointment...\n\n✓ Your appointment has been cancelled.' }]);
        // Return to entry menu after action
        if (entryMenu) {
          setTimeout(() => {
            setMessages(prev => [...prev, { 
              from: 'bot', 
              text: entryMenu.message_text + '\n\nAnything else I can help with?',
              buttons: entryMenu.buttons || []
            }]);
            setState({ type: 'menu', menuId: entryMenu.id });
          }, 500);
        }
        break;
      case 'CANCEL_ORDER':
        setMessages(prev => [...prev, { from: 'bot', text: 'Your order has been cancelled.' }]);
        // Return to entry menu after action
        if (entryMenu) {
          setTimeout(() => {
            setMessages(prev => [...prev, { 
              from: 'bot', 
              text: entryMenu.message_text,
              buttons: entryMenu.buttons || []
            }]);
            setState({ type: 'menu', menuId: entryMenu.id });
          }, 500);
        }
        break;
      default:
        setMessages(prev => [...prev, { from: 'bot', text: `Action: ${ACTION_TYPE_LABELS[button.action_type]}` }]);
    }
  };

  const handleBackNavigation = () => {
    if (menuHistory.length > 0) {
      const previousMenuId = menuHistory[menuHistory.length - 1];
      const previousMenu = menus.find(m => m.id === previousMenuId);
      setMenuHistory(prev => prev.slice(0, -1));
      
      if (previousMenu) {
        setMessages(prev => [...prev, 
          { from: 'user', text: '⬅ Back' },
          { from: 'bot', text: previousMenu.message_text, buttons: previousMenu.buttons || [] }
        ]);
        setState({ type: 'menu', menuId: previousMenuId });
      }
    } else if (entryMenu) {
      // Go back to entry menu
      setMessages(prev => [...prev, 
        { from: 'user', text: '⬅ Back' },
        { from: 'bot', text: entryMenu.message_text, buttons: entryMenu.buttons || [] }
      ]);
      setState({ type: 'menu', menuId: entryMenu.id });
    }
  };

  const handleNextStep = () => {
    if (state?.type === 'booking') {
      const nextIndex = state.stepIndex + 1;
      if (nextIndex < bookingSteps.length) {
        const nextStep = bookingSteps[nextIndex];
        setMessages(prev => [
          ...prev, 
          { from: 'user', text: '(User response)' },
          { from: 'bot', text: nextStep.prompt_text }
        ]);
        setState({ type: 'booking', stepIndex: nextIndex });
      } else {
        setMessages(prev => [
          ...prev,
          { from: 'user', text: '(User response)' },
          { from: 'bot', text: '✅ Booking confirmed! Thank you.' }
        ]);
        // Return to entry menu
        if (entryMenu) {
          setTimeout(() => {
            setMessages(prev => [...prev, { 
              from: 'bot', 
              text: entryMenu.message_text,
              buttons: entryMenu.buttons || []
            }]);
            setState({ type: 'menu', menuId: entryMenu.id });
          }, 500);
        } else {
          setState(null);
        }
      }
    }
  };

  const handleReset = () => {
    setMessages([]);
    setMenuHistory([]);
    if (entryMenu) {
      setState({ type: 'menu', menuId: entryMenu.id });
    } else {
      setState(null);
    }
  };

  const canGoBack = state?.type === 'menu' && currentMenu && !currentMenu.is_entry_point;

  return (
    <Card className="sticky top-8">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <span className="text-green-500">●</span> WhatsApp Preview
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={handleReset} title="Reset conversation">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription className="text-xs">
          Click buttons to simulate the customer flow
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* WhatsApp-style chat container */}
        <div className="bg-[#e5ddd5] dark:bg-zinc-800 rounded-lg p-3 min-h-[400px] max-h-[500px] overflow-y-auto space-y-3">
          {/* Initial greeting */}
          <div className="flex items-start gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-500">
              <MessageSquare className="h-3.5 w-3.5 text-white" />
            </div>
            <div className="bg-white dark:bg-zinc-700 rounded-lg rounded-tl-none p-3 max-w-[85%] shadow-sm">
              <p className="text-sm whitespace-pre-line">{greeting || 'Hello! How can I help you?'}</p>
            </div>
          </div>

          {/* Message history */}
          {messages.map((msg, i) => (
            <div key={i} className={`flex items-start gap-2 ${msg.from === 'user' ? 'justify-end' : ''}`}>
              {msg.from === 'bot' && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-500">
                  <MessageSquare className="h-3.5 w-3.5 text-white" />
                </div>
              )}
              <div className={`rounded-lg p-3 max-w-[85%] shadow-sm ${
                msg.from === 'user' 
                  ? 'bg-green-100 dark:bg-green-900 rounded-tr-none' 
                  : 'bg-white dark:bg-zinc-700 rounded-tl-none'
              }`}>
                <p className="text-sm whitespace-pre-line">{msg.text}</p>
              </div>
              {msg.from === 'user' && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted">
                  <User className="h-3.5 w-3.5" />
                </div>
              )}
            </div>
          ))}

          {/* Current menu buttons */}
          {currentMenu && currentMenu.buttons && currentMenu.buttons.length > 0 && (
            <div className="flex items-start gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-500">
                <MessageSquare className="h-3.5 w-3.5 text-white" />
              </div>
              <div className="bg-white dark:bg-zinc-700 rounded-lg rounded-tl-none p-3 max-w-[85%] shadow-sm space-y-2">
                {messages.length === 0 && (
                  <p className="text-sm whitespace-pre-line mb-2">{currentMenu.message_text}</p>
                )}
                <div className="space-y-1">
                  {currentMenu.buttons.map((button) => (
                    <button
                      key={button.id}
                      onClick={() => handleButtonClick(button)}
                      className="w-full text-left px-3 py-2 text-sm border rounded-lg hover:bg-muted transition-colors"
                    >
                      {button.button_label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Booking step simulation */}
          {currentStep && (
            <div className="flex justify-end">
              <Button size="sm" variant="outline" onClick={handleNextStep}>
                Simulate User Response →
              </Button>
            </div>
          )}

          {/* Back button for non-entry menus */}
          {canGoBack && (
            <div className="flex justify-center">
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={handleBackNavigation}
                className="gap-1 text-muted-foreground"
              >
                <ChevronLeft className="h-4 w-4" />
                Back to previous menu
              </Button>
            </div>
          )}

          {/* Empty state */}
          {!entryMenu && menus.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No menus configured</p>
              <p className="text-xs mt-1">Create a menu to see the preview</p>
            </div>
          )}
        </div>

        {/* State indicator */}
        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {state?.type === 'menu' && currentMenu && (
              <span className="flex items-center gap-1">
                Menu: <Badge variant="outline" className="text-xs">{currentMenu.menu_name}</Badge>
                {currentMenu.is_entry_point && <span className="text-green-600">(Entry)</span>}
              </span>
            )}
            {state?.type === 'booking' && currentStep && `Step ${state.stepIndex + 1}/${bookingSteps.length}`}
            {state?.type === 'message' && 'Custom flow'}
            {!state && 'Flow complete'}
          </span>
          <Badge variant="outline" className="text-xs">
            {messages.length} messages
          </Badge>
        </div>

        {/* Navigation breadcrumb */}
        {menuHistory.length > 0 && (
          <div className="mt-2 text-xs text-muted-foreground">
            <span>Path: </span>
            {menuHistory.map((menuId, i) => {
              const menu = menus.find(m => m.id === menuId);
              return (
                <span key={i}>
                  {menu?.menu_name || 'Menu'}
                  {i < menuHistory.length - 1 && ' → '}
                </span>
              );
            })}
            {currentMenu && (
              <>
                {menuHistory.length > 0 && ' → '}
                <span className="font-medium">{currentMenu.menu_name}</span>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}