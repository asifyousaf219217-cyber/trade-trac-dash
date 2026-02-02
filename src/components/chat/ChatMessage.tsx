import { Bot, User, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { InteractiveButtons } from "./InteractiveButtons";
import type { ChatMessageData } from "@/types/chat";

interface ChatMessageProps {
  message: ChatMessageData;
  onDelete?: (messageId: string) => void;
}

function formatMessageTime(dateString: string): string {
  try {
    return format(new Date(dateString), "h:mm a");
  } catch {
    return "";
  }
}

export function ChatMessage({ message, onDelete }: ChatMessageProps) {
  const isInbound = message.direction === "inbound";
  const isBot = message.source === "bot";
  const isAgent = message.source === "human" && !isInbound;
  const hasInteractiveButtons =
    message.metadata?.reply_type === "interactive" &&
    message.metadata?.interactive_buttons &&
    message.metadata.interactive_buttons.length > 0;

  // Determine bubble background
  const bubbleClass = isInbound
    ? "bg-[hsl(var(--chat-inbound))] text-[hsl(var(--chat-inbound-foreground))]"
    : isAgent
    ? "bg-[hsl(var(--chat-agent))] text-[hsl(var(--chat-agent-foreground))]"
    : "bg-[hsl(var(--chat-outbound))] text-[hsl(var(--chat-outbound-foreground))]";

  return (
    <div
      className={cn(
        "group flex items-end gap-2",
        isInbound ? "justify-start" : "justify-end"
      )}
    >
      {/* Customer avatar - left side */}
      {isInbound && (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary">
          <User className="h-3.5 w-3.5 text-secondary-foreground" />
        </div>
      )}

      <div className="relative max-w-[70%]">
        {/* Message bubble */}
        <div
          className={cn(
            "rounded-2xl px-4 py-2 shadow-sm",
            isInbound ? "rounded-bl-sm" : "rounded-br-sm",
            bubbleClass
          )}
        >
          <p className="whitespace-pre-wrap break-words text-sm">{message.message_text}</p>

          {/* Interactive buttons */}
          {hasInteractiveButtons && (
            <InteractiveButtons
              buttons={message.metadata!.interactive_buttons!}
              disabled
            />
          )}

          {/* Timestamp and source */}
          <div
            className={cn(
              "mt-1 flex items-center justify-end gap-1 text-[10px] opacity-70"
            )}
          >
            <span>{formatMessageTime(message.created_at)}</span>
            {!isInbound && (
              <span className="ml-1">• {isBot ? "🤖 Bot" : "👤 Agent"}</span>
            )}
          </div>
        </div>

        {/* Delete button on hover */}
        {onDelete && (
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "absolute -top-2 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100",
              isInbound ? "-right-7" : "-left-7"
            )}
            onClick={() => onDelete(message.id)}
          >
            <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
          </Button>
        )}
      </div>

      {/* Bot/Agent avatar - right side */}
      {!isInbound && (
        <div
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
            isBot ? "bg-primary" : "bg-[hsl(var(--info))]"
          )}
        >
          {isBot ? (
            <Bot className="h-3.5 w-3.5 text-primary-foreground" />
          ) : (
            <User className="h-3.5 w-3.5 text-white" />
          )}
        </div>
      )}
    </div>
  );
}
