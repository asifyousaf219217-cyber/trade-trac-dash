import { Bot, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ConversationState } from "@/types/chat";

interface AgentActionsPanelProps {
  state: ConversationState;
  onConfirmBooking?: () => void;
  onRejectBooking?: () => void;
  onReturnToBot?: () => void;
  isLoading?: boolean;
}

export function AgentActionsPanel({
  state,
  onConfirmBooking,
  onRejectBooking,
  onReturnToBot,
  isLoading,
}: AgentActionsPanelProps) {
  if (state === "BOOKING_CONFIRM") {
    return (
      <div className="border-t bg-accent/50 p-4">
        <p className="mb-3 text-sm font-medium text-foreground">
          📅 Customer is awaiting booking confirmation
        </p>
        <div className="flex gap-2">
          <Button
            onClick={onConfirmBooking}
            disabled={isLoading}
            className="gap-2 bg-[hsl(var(--success))] hover:bg-[hsl(var(--success))]/90"
          >
            <Check className="h-4 w-4" />
            Confirm Appointment
          </Button>
          <Button
            variant="destructive"
            onClick={onRejectBooking}
            disabled={isLoading}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Reject
          </Button>
        </div>
      </div>
    );
  }

  if (state === "HUMAN_REVIEW") {
    return (
      <div className="border-t bg-destructive/10 p-4">
        <p className="mb-3 text-sm font-medium text-foreground">
          🔴 Bot is paused — Agent control active
        </p>
        <Button
          onClick={onReturnToBot}
          disabled={isLoading}
          variant="outline"
          className="gap-2"
        >
          <Bot className="h-4 w-4" />
          Return to Bot
        </Button>
      </div>
    );
  }

  return null;
}
