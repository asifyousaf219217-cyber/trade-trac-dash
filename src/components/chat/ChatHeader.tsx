import { useState } from "react";
import { Bot, User, Phone, MoreVertical, Trash2, Pencil, Check, X } from "lucide-react";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import { StateBadge } from "./StateBadge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ConversationData, ConversationState } from "@/types/chat";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface ChatHeaderProps {
  conversation: ConversationData;
  onToggleBot: () => void;
  onOpenWhatsApp: () => void;
  onDeleteAllMessages: () => void;
  isTogglingBot?: boolean;
  onConversationUpdate?: (conversation: ConversationData) => void;
}

export function ChatHeader({
  conversation,
  onToggleBot,
  onOpenWhatsApp,
  onDeleteAllMessages,
  isTogglingBot,
  onConversationUpdate,
}: ChatHeaderProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [customerName, setCustomerName] = useState(conversation.customerName || '');
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();

  const handleSaveName = async () => {
    if (!conversation.id) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('conversations')
        .update({ customer_name: customerName.trim() || null })
        .eq('id', conversation.id);

      if (error) throw error;

      toast.success('Customer name saved');
      setIsEditingName(false);
      
      // Update local state and refetch
      if (onConversationUpdate) {
        onConversationUpdate({
          ...conversation,
          customerName: customerName.trim() || undefined,
        });
      }
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    } catch (err) {
      console.error('Failed to save customer name:', err);
      toast.error('Failed to save name');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setCustomerName(conversation.customerName || '');
    setIsEditingName(false);
  };

  return (
    <CardHeader className="shrink-0 border-b">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
            {conversation.customerPhone.slice(-2)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              {isEditingName ? (
                <div className="flex items-center gap-1">
                  <Input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter name..."
                    className="h-7 w-32 text-sm"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveName();
                      if (e.key === 'Escape') handleCancelEdit();
                    }}
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={handleSaveName}
                    disabled={isSaving}
                  >
                    <Check className="h-3 w-3 text-primary" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={handleCancelEdit}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <CardTitle className="truncate text-base">
                    👤 {conversation.customerName || conversation.customerPhone}
                  </CardTitle>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={() => setIsEditingName(true)}
                    title="Edit customer name"
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                </div>
              )}
              {conversation.state && (
                <StateBadge state={conversation.state as ConversationState} />
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {conversation.customerName ? conversation.customerPhone : 'WhatsApp Customer'}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <StatusBadge
            variant={conversation.botEnabled ? "info" : "warning"}
            dot
          >
            {conversation.botEnabled ? (
              <>
                <Bot className="mr-1 h-3 w-3" />
                <span className="hidden sm:inline">Bot Active</span>
              </>
            ) : (
              <>
                <User className="mr-1 h-3 w-3" />
                <span className="hidden sm:inline">Human Mode</span>
              </>
            )}
          </StatusBadge>

          <Button
            variant="outline"
            size="sm"
            onClick={onOpenWhatsApp}
            className="gap-1.5"
          >
            <Phone className="h-4 w-4" />
            <span className="hidden md:inline">WhatsApp</span>
          </Button>

          <Button
            variant={conversation.botEnabled ? "secondary" : "default"}
            size="sm"
            onClick={onToggleBot}
            disabled={isTogglingBot}
            className="gap-1.5"
          >
            {conversation.botEnabled ? (
              <>
                <User className="h-4 w-4" />
                <span className="hidden md:inline">Take Over</span>
              </>
            ) : (
              <>
                <Bot className="h-4 w-4" />
                <span className="hidden md:inline">Enable Bot</span>
              </>
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-popover z-50">
              <DropdownMenuItem
                onClick={onDeleteAllMessages}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete All Messages
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </CardHeader>
  );
}
