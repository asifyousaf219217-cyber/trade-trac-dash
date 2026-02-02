import { useState } from "react";
import { Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ChatInputProps {
  conversationId: string;
  botEnabled: boolean;
}

export function ChatInput({ botEnabled }: ChatInputProps) {
  const [message, setMessage] = useState("");

  // Human takeover feature - coming in Phase 2
  const isDisabled = true;

  const handleSend = () => {
    if (!message.trim() || isDisabled) return;
    // TODO: Implement send message in Phase 2
    setMessage("");
  };

  return (
    <div className="border-t p-4">
      <div className="flex gap-2">
        <Input
          placeholder={
            botEnabled
              ? "Bot is handling this conversation..."
              : "Type a message... (Human takeover coming soon)"
          }
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          disabled={isDisabled}
        />
        <Button disabled={isDisabled} onClick={handleSend}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        {botEnabled
          ? "Bot is actively responding to this customer"
          : "Human takeover feature coming soon"}
      </p>
    </div>
  );
}
