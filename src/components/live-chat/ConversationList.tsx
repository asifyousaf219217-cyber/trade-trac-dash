import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/hooks/useConversations";
import { formatDistanceToNow } from "date-fns";

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (conversation: Conversation) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isLoading?: boolean;
}

function formatPhoneDisplay(phone: string): string {
  // Format phone number for display (first 10 chars + ...)
  if (phone.length > 12) {
    return phone.slice(0, 12) + '...';
  }
  return phone;
}

function formatTimeAgo(dateString: string): string {
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  } catch {
    return '';
  }
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  searchQuery,
  onSearchChange,
  isLoading,
}: ConversationListProps) {
  const filteredConversations = conversations.filter(
    (conv) => conv.customerPhone.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="border-b p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center text-muted-foreground">
            Loading conversations...
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            {searchQuery ? 'No conversations found' : 'No conversations yet'}
          </div>
        ) : (
          filteredConversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => onSelect(conv)}
              className={cn(
                "flex w-full items-start gap-3 border-b border-border p-4 text-left transition-colors hover:bg-accent/50",
                selectedId === conv.id && "bg-accent"
              )}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                {conv.customerPhone.slice(-2)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-foreground">
                    {formatPhoneDisplay(conv.customerPhone)}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {formatTimeAgo(conv.lastMessageTime)}
                  </span>
                </div>
                <p className="truncate text-sm text-muted-foreground">
                  {conv.lastMessage}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <StatusBadge 
                    variant={conv.botEnabled ? "info" : "warning"} 
                    dot={false}
                  >
                    {conv.botEnabled ? "Bot Active" : "Human Mode"}
                  </StatusBadge>
                  {conv.unreadCount > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs text-primary-foreground">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </>
  );
}
