import { useState, useEffect } from "react";
import { Bot, Save, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { useBotConfig, useUpdateBotConfig, parseStaticRepliesToUI, convertToStaticReplies } from "@/hooks/useBotConfig";
import { useBusiness } from "@/hooks/useBusiness";
import { useInteractiveMenus } from "@/hooks/useInteractiveMenus";
import { useBookingSteps } from "@/hooks/useBookingSteps";
import { toast } from "@/hooks/use-toast";
import { FAQManager } from "@/components/bot-config/FAQManager";
import { InteractiveMenuBuilder } from "@/components/bot-config/InteractiveMenuBuilder";
import { BookingStepBuilder } from "@/components/bot-config/BookingStepBuilder";
import { TemplateConfigPanel } from "@/components/bot-config/TemplateConfigPanel";
import { WhatsAppPreview } from "@/components/bot-config/WhatsAppPreview";
import { getTemplateById, getTemplateLabel } from "@/data/template-definitions";
import type { FAQ, BotConfigFormData, AppointmentPrompts, OrderPrompts } from "@/types/bot-config";

const DEFAULT_CONFIG: BotConfigFormData = {
  greeting: "Welcome to our business! How can I help you today?",
  businessName: "My Business",
  businessDescription: "We provide excellent services to our customers.",
  workingHours: "Monday - Friday: 9 AM - 6 PM\nSaturday: 10 AM - 4 PM\nSunday: Closed",
  menuServices: "Service 1 - $25\nService 2 - $50\nService 3 - $75",
  faqs: [],
  isActive: false,
  fallbackMessage: "Thanks for your message! We'll get back to you soon.",
  unknownMessageHelp: "Not sure what to do? Try:\n• 'book appointment' - Schedule a service\n• 'cancel appointment' - Cancel existing booking\n• Ask about our services or hours",
  aiFallback: false,
  appointmentEnabled: false,
  appointmentPrompts: {
    service_prompt: "What service would you like to book?",
    datetime_prompt: "What date and time work for you?",
    name_prompt: "Perfect! What's your name?",
    confirmation_template: "✅ Appointment Confirmed!\n\n📅 Service: {service}\n🕐 Time: {datetime}\n👤 Name: {name}",
    cancel_message: "Booking cancelled. Anything else I can help with?",
  },
  orderEnabled: false,
  orderPrompts: {
    start_prompt: "What would you like to order?",
    item_added_template: "Added! Your order:\n\n{items}\n\nAdd more or say 'done'",
    empty_order_message: "Your order is empty. Please add items first!",
    confirmation_template: "✅ Order confirmed!\n\n{items}\n\nWe're processing your order!",
    cancel_message: "Order cancelled. Anything else I can help with?",
  },
  selectedTemplate: 'appointment',
  aiEnabled: false,
  aiApiKey: '',
  cancellationEnabled: true,
};

export default function BotConfig() {
  const { data: botConfig, isLoading } = useBotConfig();
  const { data: business } = useBusiness();
  const { data: menus = [] } = useInteractiveMenus();
  const { data: bookingSteps = [] } = useBookingSteps();
  const updateBotConfig = useUpdateBotConfig();

  const [config, setConfig] = useState<BotConfigFormData>(DEFAULT_CONFIG);
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);

  // Get template definition for conditional rendering
  const activeTemplate = activeTemplateId ? getTemplateById(activeTemplateId) : null;

  // Load data from Supabase when botConfig is available
  useEffect(() => {
    if (botConfig) {
      const { workingHours, menuServices, faqs } = parseStaticRepliesToUI(
        botConfig.static_replies || []
      );

      setConfig({
        greeting: botConfig.greeting_message || DEFAULT_CONFIG.greeting,
        businessName: business?.name || DEFAULT_CONFIG.businessName,
        businessDescription: DEFAULT_CONFIG.businessDescription,
        workingHours: workingHours || DEFAULT_CONFIG.workingHours,
        menuServices: menuServices || DEFAULT_CONFIG.menuServices,
        faqs: faqs.length > 0 ? faqs : DEFAULT_CONFIG.faqs,
        isActive: botConfig.is_active ?? false,
        fallbackMessage: botConfig.fallback_message || DEFAULT_CONFIG.fallbackMessage,
        unknownMessageHelp: botConfig.unknown_message_help || DEFAULT_CONFIG.unknownMessageHelp,
        aiFallback: botConfig.ai_fallback ?? false,
        appointmentEnabled: botConfig.appointment_enabled ?? false,
        appointmentPrompts: botConfig.appointment_prompts || DEFAULT_CONFIG.appointmentPrompts,
        orderEnabled: botConfig.order_enabled ?? false,
        orderPrompts: botConfig.order_prompts || DEFAULT_CONFIG.orderPrompts,
        selectedTemplate: (botConfig.selected_template as 'appointment' | 'order' | 'class_booking') || DEFAULT_CONFIG.selectedTemplate,
        aiEnabled: botConfig.ai_enabled ?? DEFAULT_CONFIG.aiEnabled,
        aiApiKey: DEFAULT_CONFIG.aiApiKey,
        cancellationEnabled: botConfig.cancellation_enabled ?? DEFAULT_CONFIG.cancellationEnabled,
      });
      
      // Sync activeTemplateId from database
      if (botConfig.selected_template) {
        setActiveTemplateId(botConfig.selected_template);
      }
    } else if (business) {
      setConfig(prev => ({
        ...prev,
        businessName: business.name || prev.businessName,
      }));
    }
  }, [botConfig, business]);

  const handleSave = async () => {
    try {
      const staticReplies = convertToStaticReplies(
        config.workingHours,
        config.menuServices,
        config.faqs
      );

      await updateBotConfig.mutateAsync({
        greeting_message: config.greeting,
        static_replies: staticReplies,
        is_active: config.isActive,
        fallback_message: config.fallbackMessage,
        unknown_message_help: config.unknownMessageHelp,
        ai_fallback: config.aiFallback,
        appointment_enabled: config.appointmentEnabled,
        appointment_prompts: config.appointmentPrompts,
        order_enabled: config.orderEnabled,
        order_prompts: config.orderPrompts,
      });

      toast({
        title: "Bot configuration saved!",
        description: `${staticReplies.length} auto-replies configured.`,
      });
    } catch (error) {
      console.error("Failed to save bot config:", error);
      toast({
        title: "Failed to save configuration",
        description: "An error occurred while saving your bot settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  const updateConfig = (updates: Partial<BotConfigFormData>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const handleFAQsChange = (faqs: FAQ[]) => {
    setConfig(prev => ({ ...prev, faqs }));
  };

  const handleTemplateChange = (templateId: string) => {
    setActiveTemplateId(templateId);
    // The template will also update appointment_enabled/order_enabled via the hook
    // which will then sync via useEffect when botConfig updates
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Determine which sections to show based on active template
  const showAppointmentSection = !activeTemplate || activeTemplate.industry === 'appointment';
  const showOrderSection = !activeTemplate || activeTemplate.industry === 'order';
  const showBookingSteps = config.appointmentEnabled || config.orderEnabled;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-accent p-2">
              <Bot className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <h1 className="page-title">Bot Configuration</h1>
              <p className="page-description">Customize your bot's messages and behavior</p>
            </div>
          </div>
          <StatusBadge variant={config.isActive ? "active" : "inactive"}>
            {config.isActive ? "Active" : "Inactive"}
          </StatusBadge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Configuration Form */}
        <div className="space-y-6 lg:col-span-2">
          {/* Quick Start Template */}
          <TemplateConfigPanel
            selectedTemplate={activeTemplateId}
            onTemplateChange={handleTemplateChange}
            hasExistingData={menus.length > 0 || bookingSteps.length > 0}
          />

          {/* Bot Status */}
          <Card>
            <CardHeader>
              <CardTitle>Bot Status</CardTitle>
              <CardDescription>Enable or disable your bot</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Activate Bot</Label>
                  <p className="text-sm text-muted-foreground">
                    When active, the bot will automatically respond to messages
                  </p>
                </div>
                <Switch
                  checked={config.isActive}
                  onCheckedChange={(isActive) => updateConfig({ isActive })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Business Info */}
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>Basic information about your business</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    value={config.businessName}
                    onChange={(e) => updateConfig({ businessName: e.target.value })}
                    placeholder="Your Business Name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="workingHours">Working Hours</Label>
                  <Textarea
                    id="workingHours"
                    value={config.workingHours}
                    onChange={(e) => updateConfig({ workingHours: e.target.value })}
                    placeholder="Mon-Fri: 9 AM - 6 PM"
                    rows={3}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="menuServices">Menu / Services List</Label>
                <Textarea
                  id="menuServices"
                  value={config.menuServices}
                  onChange={(e) => updateConfig({ menuServices: e.target.value })}
                  placeholder="Item 1 - $10&#10;Item 2 - $20"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Messages */}
          <Card>
            <CardHeader>
              <CardTitle>Greeting Message</CardTitle>
              <CardDescription>The first message customers will see</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                id="greeting"
                value={config.greeting}
                onChange={(e) => updateConfig({ greeting: e.target.value })}
                placeholder="Welcome message for new conversations..."
                rows={3}
              />
            </CardContent>
          </Card>

          {/* FAQ Manager */}
          <FAQManager
            faqs={config.faqs}
            onFAQsChange={handleFAQsChange}
          />

          {/* Fallback Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Fallback Settings</CardTitle>
              <CardDescription>Configure what happens when no match is found</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fallbackMessage">Fallback Message</Label>
                <Textarea
                  id="fallbackMessage"
                  value={config.fallbackMessage}
                  onChange={(e) => updateConfig({ fallbackMessage: e.target.value })}
                  placeholder="Message sent when no keyword match is found..."
                  rows={2}
                />
                <p className="text-xs text-muted-foreground">
                  This message is sent when no FAQ matches and AI is disabled
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="unknownMessageHelp">Unknown Message Help</Label>
                <Textarea
                  id="unknownMessageHelp"
                  value={config.unknownMessageHelp}
                  onChange={(e) => updateConfig({ unknownMessageHelp: e.target.value })}
                  placeholder="Not sure what to do? Try:&#10;• 'book appointment' - Schedule a service&#10;• 'cancel appointment' - Cancel existing booking&#10;• Ask about our services or hours"
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  Message shown when bot doesn't understand. Suggest available commands.
                </p>
              </div>
              <div className="flex items-center justify-between pt-2">
                <div>
                  <Label className="text-base">AI Fallback</Label>
                  <p className="text-sm text-muted-foreground">
                    Try Gemini AI to generate a response when no FAQ matches
                  </p>
                </div>
                <Switch
                  checked={config.aiFallback}
                  onCheckedChange={(aiFallback) => updateConfig({ aiFallback })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Interactive Menus */}
          <InteractiveMenuBuilder />

          {/* Booking Steps - show when appointments OR orders are enabled */}
          {showBookingSteps && <BookingStepBuilder />}

          {/* Appointment Bot Configuration */}
          <Card className={!showAppointmentSection ? 'opacity-60' : ''}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>📅</span> Appointment Bot
                {activeTemplate?.industry === 'order' && (
                  <Badge variant="secondary" className="text-xs">
                    Disabled for {activeTemplate.label}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>Enable appointment booking via WhatsApp</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Enable Appointment Booking</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow customers to book and cancel appointments via WhatsApp
                  </p>
                </div>
                <Switch
                  checked={config.appointmentEnabled}
                  onCheckedChange={(appointmentEnabled) => updateConfig({ appointmentEnabled })}
                  disabled={activeTemplate?.industry === 'order'}
                />
              </div>

              {config.appointmentEnabled && (
                <div className="rounded-md bg-muted/50 p-3 border">
                  <p className="text-sm font-medium text-foreground">✅ Appointments Active</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Customers reach this flow when they tap 📅 Book Appointment.
                    Configure the questions in the <strong>Booking Steps</strong> section above.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Bot Configuration */}
          <Card className={!showOrderSection ? 'opacity-60' : ''}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>🛒</span> Order Bot
                {activeTemplate?.industry === 'appointment' && (
                  <Badge variant="secondary" className="text-xs">
                    Disabled for {activeTemplate.label}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>Enable order collection via WhatsApp</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Enable Order Collection</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow customers to place and manage orders via WhatsApp
                  </p>
                </div>
                <Switch
                  checked={config.orderEnabled}
                  onCheckedChange={(orderEnabled) => updateConfig({ orderEnabled })}
                  disabled={activeTemplate?.industry === 'appointment'}
                />
              </div>

              {config.orderEnabled && (
                <div className="rounded-md bg-muted/50 p-3 border">
                  <p className="text-sm font-medium text-foreground">✅ Orders Active</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Customers reach this flow when they tap 🛒 Place Order.
                    Orders work through the interactive menu buttons.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={updateBotConfig.isPending}>
              {updateBotConfig.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {updateBotConfig.isPending ? "Saving..." : "Save Configuration"}
            </Button>
          </div>
        </div>

        {/* Live Preview */}
        <div className="lg:col-span-1">
          <WhatsAppPreview
            menus={menus}
            bookingSteps={bookingSteps}
            greeting={config.greeting}
            templateName={activeTemplateId ? getTemplateLabel(activeTemplateId) : undefined}
            templateId={activeTemplateId}
          />
        </div>
      </div>
    </div>
  );
}
