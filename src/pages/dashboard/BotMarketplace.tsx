import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Store, Check, MessageSquare } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";
import { BOT_TEMPLATES, type MarketplaceBot } from "@/data/bot-templates";
import { useUpdateBotConfig, convertToStaticReplies } from "@/hooks/useBotConfig";
import { useBusiness } from "@/hooks/useBusiness";
import { generateFAQId } from "@/types/bot-config";
import { toast } from "@/hooks/use-toast";

export default function BotMarketplace() {
  const navigate = useNavigate();
  const [selectedBot, setSelectedBot] = useState<string | null>(null);
  const [previewBot, setPreviewBot] = useState<MarketplaceBot | null>(null);
  const { data: business } = useBusiness();
  const updateBotConfig = useUpdateBotConfig();

  const handleSelectBot = async (bot: MarketplaceBot) => {
    if (!business) {
      toast({
        title: "No business found",
        description: "Please set up your business first.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Generate unique IDs for FAQs
      const faqs = bot.faqs.map(faq => ({
        ...faq,
        id: generateFAQId(),
      }));

      // Convert to static replies format
      const staticReplies = convertToStaticReplies(
        bot.workingHours,
        bot.menuServices,
        faqs
      );

      // Save to Supabase
      await updateBotConfig.mutateAsync({
        greeting_message: bot.greeting,
        static_replies: staticReplies,
        fallback_message: bot.fallbackMessage,
        is_active: true,
      });

      setSelectedBot(bot.id);

      toast({
        title: `${bot.name} Applied!`,
        description: "Your bot configuration has been updated. Redirecting to Bot Config...",
      });

      // Navigate to Bot Config after a short delay
      setTimeout(() => {
        navigate("/dashboard/bot-config");
      }, 1500);
    } catch (error) {
      console.error("Failed to apply bot template:", error);
      toast({
        title: "Failed to apply template",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-accent p-2">
            <Store className="h-5 w-5 text-accent-foreground" />
          </div>
          <div>
            <h1 className="page-title">Bot Marketplace</h1>
            <p className="page-description">Choose a pre-built bot template for your business</p>
          </div>
        </div>
      </div>

      {selectedBot && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 px-4 py-3">
          <Check className="h-5 w-5 text-success" />
          <span className="text-sm font-medium text-success">
            {BOT_TEMPLATES.find((b) => b.id === selectedBot)?.name} applied! Redirecting to Bot Config...
          </span>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {BOT_TEMPLATES.map((bot) => {
          const isSelected = selectedBot === bot.id;

          return (
            <Card
              key={bot.id}
              className={cn(
                "cursor-pointer transition-all duration-200 hover:shadow-md",
                isSelected && "ring-2 ring-primary"
              )}
              onClick={() => setPreviewBot(bot)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-lg text-2xl",
                      isSelected ? "bg-primary" : "bg-accent"
                    )}>
                      {bot.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{bot.name}</CardTitle>
                      <CardDescription className="mt-1 line-clamp-2">{bot.description}</CardDescription>
                    </div>
                  </div>
                  {isSelected && <StatusBadge variant="active">Active</StatusBadge>}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-foreground">Use Case</h4>
                    <p className="mt-1 text-sm text-muted-foreground">{bot.useCase}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-foreground">Features</h4>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {bot.features.slice(0, 3).map((feature) => (
                        <span
                          key={feature}
                          className="rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground"
                        >
                          {feature}
                        </span>
                      ))}
                      {bot.features.length > 3 && (
                        <span className="rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground">
                          +{bot.features.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    variant={isSelected ? "outline" : "default"}
                    disabled={updateBotConfig.isPending}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectBot(bot);
                    }}
                  >
                    {isSelected ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Applied
                      </>
                    ) : (
                      "Use This Template"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Preview Modal */}
      {previewBot && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4 backdrop-blur-sm"
          onClick={() => setPreviewBot(null)}
        >
          <Card
            className="max-h-[80vh] w-full max-w-lg overflow-y-auto animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent text-2xl">
                  {previewBot.icon}
                </div>
                <div>
                  <CardTitle>{previewBot.name}</CardTitle>
                  <CardDescription>{previewBot.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="mb-2 text-sm font-medium text-foreground">Features</h4>
                <div className="flex flex-wrap gap-2">
                  {previewBot.features.map((feature) => (
                    <span
                      key={feature}
                      className="rounded-full bg-primary/10 px-2.5 py-1 text-xs text-primary"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="mb-2 text-sm font-medium text-foreground">Included FAQs</h4>
                <div className="space-y-2">
                  {previewBot.faqs.map((faq) => (
                    <div key={faq.id} className="rounded-lg bg-secondary/50 p-3">
                      <p className="text-sm font-medium">{faq.question}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="mb-3 text-sm font-medium text-foreground">Example Conversations</h4>
                <div className="space-y-3 rounded-lg bg-secondary/50 p-4">
                  {previewBot.exampleReplies.map((reply, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary">
                        <MessageSquare className="h-3.5 w-3.5 text-primary-foreground" />
                      </div>
                      <div className="chat-bubble-outgoing flex-1">
                        <p className="text-sm">{reply}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setPreviewBot(null)}
                >
                  Close
                </Button>
                <Button
                  className="flex-1"
                  disabled={updateBotConfig.isPending}
                  onClick={() => {
                    handleSelectBot(previewBot);
                    setPreviewBot(null);
                  }}
                >
                  {updateBotConfig.isPending ? "Applying..." : "Use This Template"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
