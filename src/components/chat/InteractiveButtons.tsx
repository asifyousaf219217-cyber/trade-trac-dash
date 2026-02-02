import { cn } from "@/lib/utils";
import type { InteractiveButton } from "@/types/chat";

interface InteractiveButtonsProps {
  buttons: InteractiveButton[];
  disabled?: boolean;
  className?: string;
}

export function InteractiveButtons({ buttons, disabled = true, className }: InteractiveButtonsProps) {
  // Only show max 3 buttons per WhatsApp spec
  const displayButtons = buttons.slice(0, 3);

  return (
    <div className={cn("mt-2 flex flex-wrap gap-2", className)}>
      {displayButtons.map((btn) => (
        <button
          key={btn.id}
          disabled={disabled}
          className={cn(
            "rounded-full border border-[hsl(var(--chat-chip-border))] bg-[hsl(var(--chat-chip-bg))] px-4 py-1.5",
            "text-sm font-medium text-foreground",
            "shadow-sm transition-all duration-150",
            "disabled:cursor-default disabled:opacity-70",
            !disabled && "hover:bg-accent hover:shadow-md active:scale-95"
          )}
        >
          {btn.title}
        </button>
      ))}
    </div>
  );
}
