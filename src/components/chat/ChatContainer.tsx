import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
import { ChatHeader } from "./ChatHeader";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { AgentActionsPanel } from "./AgentActionsPanel";
import { useToggleBotStatus } from "@/hooks/useToggleBotStatus";
import { useDeleteMessage, useDeleteConversationMessages } from "@/hooks/useDeleteMessages";
import { useSendAgentMessage } from "@/hooks/useSendAgentMessage";
import { useUpdateConversationState } from "@/hooks/useUpdateConversationState";
import type { ConversationData, ChatMessageData, ConversationState } from "@/types/chat";

interface ChatContainerProps {
  conversation: ConversationData | null;
  messages: ChatMessageData[];
  isLoading?: boolean;
  onConversationUpdate?: (conversation: ConversationData) => void;
}

export function ChatContainer({
  conversation,
  messages,
  isLoading,
  onConversationUpdate,
}: ChatContainerProps) {
  const toggleBotStatus = useToggleBotStatus();
  const deleteMessage = useDeleteMessage();
  const deleteAllMessages = useDeleteConversationMessages();
  const sendAgentMessage = useSendAgentMessage();
  const updateConversationState = useUpdateConversationState();

  const [deleteAllDialogOpen, setDeleteAllDialogOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);

  const handleToggleBot = () => {
    if (!conversation) return;

    const newBotEnabled = !conversation.botEnabled;
    toggleBotStatus.mutate(
      { conversationId: conversation.id, botEnabled: newBotEnabled },
      {
        onSuccess: () => {
          if (onConversationUpdate) {
            onConversationUpdate({ ...conversation, botEnabled: newBotEnabled });
          }
        },
      }
    );
  };

  const handleOpenWhatsApp = () => {
    if (!conversation) return;
    const phone = conversation.customerPhone.replace(/\D/g, "");
    window.open(`https://wa.me/${phone}`, "_blank");
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

  const handleSendMessage = (text: string) => {
    if (!conversation) return;
    sendAgentMessage.mutate({
      conversationId: conversation.id,
      customerPhone: conversation.customerPhone,
      messageText: text,
    });
  };

  const handleConfirmBooking = () => {
    if (!conversation) return;
    // Update state to completed and re-enable bot
    updateConversationState.mutate({
      conversationId: conversation.id,
      state: 'NEW',
      botEnabled: true,
    });
  };

  const handleRejectBooking = () => {
    if (!conversation) return;
    updateConversationState.mutate({
      conversationId: conversation.id,
      state: 'HUMAN_REVIEW',
      botEnabled: false,
    });
  };

  const handleReturnToBot = () => {
    if (!conversation) return;
    updateConversationState.mutate(
      {
        conversationId: conversation.id,
        state: 'AWAITING_INTENT',
        botEnabled: true,
      },
      {
        onSuccess: () => {
          if (onConversationUpdate) {
            onConversationUpdate({ ...conversation, botEnabled: true });
          }
        },
      }
    );
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

  const conversationState = (conversation.state || 'NEW') as ConversationState;

  return (
    <>
      <Card className="flex h-full flex-col overflow-hidden lg:col-span-2">
        <ChatHeader
          conversation={conversation}
          onToggleBot={handleToggleBot}
          onOpenWhatsApp={handleOpenWhatsApp}
          onDeleteAllMessages={() => setDeleteAllDialogOpen(true)}
          isTogglingBot={toggleBotStatus.isPending}
        />

        <CardContent className="flex-1 overflow-y-auto p-0">
          <MessageList
            messages={messages}
            isLoading={isLoading}
            onDeleteMessage={(id) => setMessageToDelete(id)}
          />
        </CardContent>

        <AgentActionsPanel
          state={conversationState}
          onConfirmBooking={handleConfirmBooking}
          onRejectBooking={handleRejectBooking}
          onReturnToBot={handleReturnToBot}
          isLoading={updateConversationState.isPending}
        />

        <MessageInput
          onSend={handleSendMessage}
          disabled={conversation.botEnabled}
          isLoading={sendAgentMessage.isPending}
          placeholder={
            conversation.botEnabled
              ? "Bot is handling this conversation..."
              : "Type a message..."
          }
        />
      </Card>

      {/* Delete Single Message Dialog */}
      <AlertDialog
        open={!!messageToDelete}
        onOpenChange={() => setMessageToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Message</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this message? This action cannot
              be undone.
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
      <AlertDialog
        open={deleteAllDialogOpen}
        onOpenChange={setDeleteAllDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete All Messages</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete all messages in this conversation?
              This will free up storage space but cannot be undone.
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
