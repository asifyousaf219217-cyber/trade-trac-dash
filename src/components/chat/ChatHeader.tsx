import { Bot, User, Phone, MoreVertical, Trash2 } from "lucide-react";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { StateBadge } from "./StateBadge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ConversationData, ConversationState } from "@/types/chat";

interface ChatHeaderProps {
  conversation: ConversationData;
  onToggleBot: () => void;
  onOpenWhatsApp: () => void;
  onDeleteAllMessages: () => void;
  isTogglingBot?: boolean;
}

export function ChatHeader({
  conversation,
  onToggleBot,
  onOpenWhatsApp,
  onDeleteAllMessages,
  isTogglingBot,
}: ChatHeaderProps) {
  return (
    <CardHeader className="shrink-0 border-b">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
            {conversation.customerPhone.slice(-2)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <CardTitle className="truncate text-base">
                👤 {conversation.customerPhone}
              </CardTitle>
              {conversation.state && (
                <StateBadge state={conversation.state as ConversationState} />
              )}
            </div>
            <p className="text-sm text-muted-foreground">WhatsApp Customer</p>
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
