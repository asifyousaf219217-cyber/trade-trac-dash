import { useEffect, useRef, useState } from 'react';
import { RotateCcw, Send, MessageSquare, User, Wifi, WifiOff } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { usePreviewBot, type PreviewMessage } from '@/hooks/usePreviewBot';

interface WhatsAppPreviewRPCProps {
  businessId: string | null;
  templateName?: string;
}

export function WhatsAppPreviewRPC({ businessId, templateName }: WhatsAppPreviewRPCProps) {
  const { messages, isLoading, error, sendMessage, resetPreview, startPreview, previewState } = usePreviewBot(businessId);
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasStartedRef = useRef(false);

  // Start preview on mount or when businessId changes
  useEffect(() => {
    if (businessId && !hasStartedRef.current) {
      hasStartedRef.current = true;
      startPreview();
    }
  }, [businessId, startPreview]);

  // Reset start flag when businessId changes
  useEffect(() => {
    hasStartedRef.current = false;
  }, [businessId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    const text = inputValue.trim();
    if (text && !isLoading) {
      sendMessage(text);
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleButtonClick = (button: { id: string; title: string }) => {
    sendMessage(button.title, button.id);
  };

  const handleReset = () => {
    hasStartedRef.current = false;
    resetPreview();
    setTimeout(() => {
      hasStartedRef.current = true;
      startPreview();
    }, 100);
  };

  if (!businessId) {
    return (
      <Card className="sticky top-8">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <WifiOff className="h-4 w-4 text-muted-foreground" />
            WhatsApp Preview
          </CardTitle>
          <CardDescription className="text-xs">
            No business configured
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 rounded-lg p-8 text-center text-muted-foreground text-sm">
            Configure your business to enable preview
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="sticky top-8">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Wifi className="h-4 w-4 text-primary" />
            WhatsApp Preview
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={handleReset} title="Reset conversation">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription className="text-xs flex items-center gap-2">
          <span>Live RPC:</span>
          <Badge variant="outline">{templateName || 'Custom Bot'}</Badge>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Error alert */}
        {error && (
          <div className="bg-destructive/10 text-destructive text-xs p-2 rounded">
            {error}
          </div>
        )}

        {/* WhatsApp-style chat container */}
        <div 
          ref={scrollRef}
          className="bg-secondary/50 rounded-lg p-3 min-h-[350px] max-h-[450px] overflow-y-auto space-y-3"
        >
          {messages.length === 0 && !isLoading && (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              Starting conversation...
            </div>
          )}

          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} onButtonClick={handleButtonClick} />
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex items-start gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary">
                <MessageSquare className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              <div className="bg-card rounded-lg rounded-tl-none p-3 shadow-sm">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            size="icon" 
            onClick={handleSend} 
            disabled={!inputValue.trim() || isLoading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* State indicator */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            State: <Badge variant="outline" className="text-xs">{previewState.state}</Badge>
          </span>
          <Badge variant="outline" className="text-xs">
            {messages.length} messages
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

interface MessageBubbleProps {
  message: PreviewMessage;
  onButtonClick: (button: { id: string; title: string }) => void;
}

function MessageBubble({ message, onButtonClick }: MessageBubbleProps) {
  const isUser = message.sender === 'user';

  return (
    <div className={`flex items-start gap-2 ${isUser ? 'justify-end' : ''}`}>
      {!isUser && (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary">
          <MessageSquare className="h-3.5 w-3.5 text-primary-foreground" />
        </div>
      )}
      <div className={`rounded-lg p-3 max-w-[85%] shadow-sm ${
        isUser
          ? 'bg-accent rounded-tr-none'
          : 'bg-card rounded-tl-none'
      }`}>
        <p className="text-sm whitespace-pre-line">{message.text}</p>
        
        {/* Interactive buttons */}
        {message.buttons && message.buttons.length > 0 && (
          <div className="mt-2 space-y-1">
            {message.buttons.map((btn) => (
              <button
                key={btn.id}
                onClick={() => onButtonClick(btn)}
                className="w-full text-left px-3 py-2 text-sm border rounded-lg hover:bg-muted transition-colors text-primary border-primary/30"
              >
                {btn.title}
              </button>
            ))}
          </div>
        )}
      </div>
      {isUser && (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted">
          <User className="h-3.5 w-3.5" />
        </div>
      )}
    </div>
  );
}
