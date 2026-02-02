import { cn } from "@/lib/utils";
import { stateConfig, type ConversationState } from "@/types/chat";

interface StateBadgeProps {
  state: ConversationState;
  className?: string;
}

export function StateBadge({ state, className }: StateBadgeProps) {
  const config = stateConfig[state] || stateConfig['NEW'];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium text-white",
        config.colorClass,
        className
      )}
    >
      {config.label}
    </span>
  );
}
