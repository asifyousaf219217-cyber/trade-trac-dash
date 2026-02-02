import { useRef, useEffect, useState } from "react";
import { Bot, User, MessageSquare, Phone, UserCheck, Trash2, MoreVertical } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/hooks/useConversations";
import type { ChatMessage } from "@/hooks/useConversationMessages";
import { format } from "date-fns";
import { ChatInput } from "./ChatInput";
import { useToggleBotStatus } from "@/hooks/useToggleBotStatus";
import { useDeleteMessage, useDeleteConversationMessages } from "@/hooks/useDeleteMessages";

interface ChatWindowProps {
  conversation: Conversation | null;
  messages: ChatMessage[];
  isLoading?: boolean;
  onConversationUpdate?: (conversation: Conversation) => void;
}

function formatMessageTime(dateString: string): string {
  try {
    return format(new Date(dateString), "h:mm a");
  } catch {
    return "";
  }
}

export function ChatWindow({ conversation, messages, isLoading, onConversationUpdate }: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const toggleBotStatus = useToggleBotStatus();
  const deleteMessage = useDeleteMessage();
  const deleteAllMessages = useDeleteConversationMessages();
  
  const [deleteAllDialogOpen, setDeleteAllDialogOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleToggleBot = () => {
    if (!conversation) return;
    
    const newBotEnabled = !conversation.botEnabled;
    toggleBotStatus.mutate(
      { conversationId: conversation.id, botEnabled: newBotEnabled },
      {
        onSuccess: () => {
          // Update local state
          if (onConversationUpdate) {
            onConversationUpdate({ ...conversation, botEnabled: newBotEnabled });
          }
        }
      }
    );
  };

  const handleOpenWhatsApp = () => {
    if (!conversation) return;
    // Remove any non-digit characters and open WhatsApp web
    const phone = conversation.customerPhone.replace(/\D/g, '');
    window.open(`https://wa.me/${phone}`, '_blank');
  };

  const handleDeleteMessage = (messageId: string) => {
    deleteMessage.mutate(messageId);
    setMessageToDelete(null);
  };

  const handleDeleteAllMessages = () => {
    if (!conversation) return;
    deleteAllMessages.mutate(conversation.id);
    setDeleteAllDialogOpen(false);
  };

  if (!conversation) {
    return (
      <Card className="flex flex-1 flex-col lg:col-span-2">
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium text-foreground">
              No conversation selected
            </h3>
            <p className="text-sm text-muted-foreground">
              Select a conversation from the list to view messages
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="flex h-full flex-col overflow-hidden lg:col-span-2">
        {/* Chat Header */}
        <CardHeader className="shrink-0 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                {conversation.customerPhone.slice(-2)}
              </div>
              <div>
                <CardTitle className="text-base">
                  {conversation.customerPhone}
                </CardTitle>
                <p className="text-sm text-muted-foreground">WhatsApp Customer</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge variant={conversation.botEnabled ? "info" : "warning"} dot>
                {conversation.botEnabled ? (
                  <>
                    <Bot className="mr-1 h-3 w-3" />
                    Bot Replying
                  </>
                ) : (
                  <>
                    <User className="mr-1 h-3 w-3" />
                    Human Mode
                  </>
                )}
              </StatusBadge>
              
              {/* WhatsApp Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenWhatsApp}
                className="gap-1.5"
              >
                <Phone className="h-4 w-4" />
                <span className="hidden sm:inline">WhatsApp</span>
              </Button>
              
              {/* Human Takeover / Enable Bot Button */}
              <Button
                variant={conversation.botEnabled ? "secondary" : "default"}
                size="sm"
                onClick={handleToggleBot}
                disabled={toggleBotStatus.isPending}
                className="gap-1.5"
              >
                {conversation.botEnabled ? (
                  <>
                    <UserCheck className="h-4 w-4" />
                    <span className="hidden sm:inline">Take Over</span>
                  </>
                ) : (
                  <>
                    <Bot className="h-4 w-4" />
                    <span className="hidden sm:inline">Enable Bot</span>
                  </>
                )}
              </Button>

              {/* More Options Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-popover z-50">
                  <DropdownMenuItem 
                    onClick={() => setDeleteAllDialogOpen(true)}
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

        {/* Messages - scrollable container */}
        <CardContent className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground">Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground">No messages yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "group flex items-end gap-2",
                    message.direction === "inbound" ? "justify-start" : "justify-end"
                  )}
                >
                  {message.direction === "inbound" && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary">
                      <User className="h-3.5 w-3.5 text-secondary-foreground" />
                    </div>
                  )}
                  <div className="relative">
                    <div
                      className={cn(
                        "max-w-[70%] rounded-2xl px-4 py-2",
                        message.direction === "inbound"
                          ? "bg-secondary text-secondary-foreground"
                          : "bg-primary text-primary-foreground"
                      )}
                    >
                      <p className="text-sm">{message.message_text}</p>
                      <div
                        className={cn(
                          "mt-1 flex items-center gap-1 text-[10px]",
                          message.direction === "inbound"
                            ? "text-muted-foreground"
                            : "text-primary-foreground/70"
                        )}
                      >
                        <span>{formatMessageTime(message.created_at)}</span>
                        {message.direction === "outbound" && (
                          <span className="ml-1">
                            • {message.source === "bot" ? "Bot" : "Human"}
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Delete button - appears on hover */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "absolute -top-2 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100",
                        message.direction === "inbound" ? "-right-7" : "-left-7"
                      )}
                      onClick={() => setMessageToDelete(message.id)}
                    >
                      <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                  {message.direction === "outbound" && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary">
                      {message.source === "bot" ? (
                        <Bot className="h-3.5 w-3.5 text-primary-foreground" />
                      ) : (
                        <User className="h-3.5 w-3.5 text-primary-foreground" />
                      )}
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </CardContent>

        {/* Message Input - fixed at bottom */}
        <div className="shrink-0">
          <ChatInput conversationId={conversation.id} botEnabled={conversation.botEnabled} />
        </div>
      </Card>

      {/* Delete Single Message Dialog */}
      <AlertDialog open={!!messageToDelete} onOpenChange={() => setMessageToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Message</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this message? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => messageToDelete && handleDeleteMessage(messageToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete All Messages Dialog */}
      <AlertDialog open={deleteAllDialogOpen} onOpenChange={setDeleteAllDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete All Messages</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete all messages in this conversation? This will free up storage space but cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAllMessages}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
