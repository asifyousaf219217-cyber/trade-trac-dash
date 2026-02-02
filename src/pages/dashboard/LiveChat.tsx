import { useState, useEffect } from "react";
import { MessageSquare } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useConversations, type Conversation } from "@/hooks/useConversations";
import { useConversationMessages } from "@/hooks/useConversationMessages";
import { ConversationList } from "@/components/live-chat/ConversationList";
import { ChatContainer } from "@/components/chat/ChatContainer";
import type { ConversationData, ChatMessageData } from "@/types/chat";

export default function LiveChat() {
  const { data: conversations = [], isLoading: conversationsLoading } = useConversations();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Keep selected conversation in sync with updated data from the server
  useEffect(() => {
    if (selectedConversation && conversations.length > 0) {
      const updated = conversations.find(c => c.id === selectedConversation.id);
      if (updated) {
        setSelectedConversation(updated);
      }
    }
  }, [conversations, selectedConversation?.id]);

  const { data: messages = [], isLoading: messagesLoading } = useConversationMessages(
    selectedConversation?.id ?? null
  );

  // Auto-select first conversation if none selected
  const activeConversation = selectedConversation || (conversations.length > 0 ? conversations[0] : null);

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };

  const handleConversationUpdate = (updatedConversation: ConversationData) => {
    setSelectedConversation(updatedConversation);
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-accent p-2">
            <MessageSquare className="h-5 w-5 text-accent-foreground" />
          </div>
          <div>
            <h1 className="page-title">Live Chat</h1>
            <p className="page-description">
              Monitor and manage customer conversations in real-time
            </p>
          </div>
        </div>
      </div>

      <div className="grid h-[calc(100vh-12rem)] gap-4 lg:grid-cols-3">
        {/* Conversations List */}
        <Card className="flex flex-col lg:col-span-1">
          <ConversationList
            conversations={conversations}
            selectedId={activeConversation?.id ?? null}
            onSelect={handleSelectConversation}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            isLoading={conversationsLoading}
          />
        </Card>

        {/* Chat Container */}
        <ChatContainer
          conversation={activeConversation as ConversationData | null}
          messages={messages as ChatMessageData[]}
          isLoading={messagesLoading}
          onConversationUpdate={handleConversationUpdate}
        />
      </div>
    </div>
  );
}
