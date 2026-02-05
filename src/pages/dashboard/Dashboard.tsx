 import { MessageSquare, ShoppingCart, Calendar, Smartphone, Bot, Sparkles, Loader2 } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
 import { useAnalytics } from "@/hooks/useAnalytics";
 import { useBotConfig } from "@/hooks/useBotConfig";
 import { useBusiness } from "@/hooks/useBusiness";
 import { useWhatsAppNumber } from "@/hooks/useWhatsApp";
 import { useAISettings } from "@/hooks/useAISettings";

export default function Dashboard() {
   const { data: analytics, isLoading: analyticsLoading } = useAnalytics();
   const { data: botConfig, isLoading: botConfigLoading } = useBotConfig();
   const { data: business, isLoading: businessLoading } = useBusiness();
   const { data: whatsappNumber, isLoading: whatsappLoading } = useWhatsAppNumber();
   const { data: aiSettings } = useAISettings();
 
   // Calculate today's stats from analytics (last day in array)
   const todayMessages = analytics?.messagesData?.[analytics.messagesData.length - 1]?.messages || 0;
   const todayOrders = analytics?.ordersData?.[analytics.ordersData.length - 1]?.orders || 0;
   const todayAppointments = analytics?.appointmentsData?.[analytics.appointmentsData.length - 1]?.appointments || 0;
 
   // Reactive status indicators
   const whatsappConnected = whatsappNumber?.verification_status === 'connected';
   const botActive = botConfig?.is_active === true;
   const aiEnabled = aiSettings?.ai_enabled === true;
 
   const isLoading = analyticsLoading || botConfigLoading || businessLoading || whatsappLoading;
 
  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
         <p className="page-description">
           {business ? `Welcome back, ${business.name}!` : "Welcome back!"} Here's what's happening today.
         </p>
      </div>

      {/* Connection Status Cards */}
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
             <CardTitle className="text-sm font-medium">WhatsApp</CardTitle>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
               {whatsappLoading ? (
                 <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
               ) : (
                 <StatusBadge variant={whatsappConnected ? "active" : "warning"}>
                   {whatsappConnected ? "Connected" : "Not Connected"}
                 </StatusBadge>
               )}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
               {whatsappConnected
                 ? `Connected: ${whatsappNumber?.display_phone_number || 'WhatsApp Business'}`
                 : "Connect your WhatsApp Business number"}
            </p>
             {!whatsappConnected && (
               <Button asChild variant="outline" size="sm" className="mt-3">
                 <Link to="/dashboard/whatsapp">Connect Now</Link>
               </Button>
             )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
             <CardTitle className="text-sm font-medium">Chatbot</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
               {botConfigLoading ? (
                 <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
               ) : (
                 <StatusBadge variant={botActive ? "active" : "inactive"}>
                   {botActive ? "Active" : "Not Active"}
                 </StatusBadge>
               )}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
               {botActive
                 ? "Your chatbot is live and responding"
                 : "Choose a template to get started"}
            </p>
             {!botActive && (
               <Button asChild variant="outline" size="sm" className="mt-3">
                 <Link to="/dashboard/marketplace">Choose Template</Link>
               </Button>
             )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
             <CardTitle className="text-sm font-medium">Smart Replies</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
               <StatusBadge variant={aiEnabled ? "active" : "default"}>
                 {aiEnabled ? "AI Enabled" : "Manual Mode"}
               </StatusBadge>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
               {aiEnabled
                 ? "AI is handling complex questions"
                 : "Enable AI for smarter, personalized replies"}
            </p>
             {!aiEnabled && (
               <Button asChild variant="outline" size="sm" className="mt-3">
                 <Link to="/dashboard/ai-settings">Enable Smart Replies</Link>
               </Button>
             )}
          </CardContent>
        </Card>
      </div>

      {/* Stats */}
      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Today's Stats</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Messages"
             value={analyticsLoading ? "..." : String(todayMessages)}
            description="Total messages today"
            icon={MessageSquare}
            trend={{ value: 0, isPositive: true }}
          />
          <StatCard
            title="Orders"
             value={analyticsLoading ? "..." : String(todayOrders)}
            description="Orders received"
            icon={ShoppingCart}
            trend={{ value: 0, isPositive: true }}
          />
          <StatCard
            title="Appointments"
             value={analyticsLoading ? "..." : String(todayAppointments)}
            description="Appointments booked"
            icon={Calendar}
            trend={{ value: 0, isPositive: true }}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Setup Guide</CardTitle>
          <CardDescription>Complete these steps to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-4 rounded-lg border border-border p-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground">
                1
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-foreground">Connect WhatsApp</h4>
                <p className="text-sm text-muted-foreground">
                  Link your WhatsApp Business account to start receiving messages
                </p>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link to="/dashboard/whatsapp">Connect</Link>
              </Button>
            </div>

            <div className="flex items-start gap-4 rounded-lg border border-border p-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground">
                2
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-foreground">Choose a Bot</h4>
                <p className="text-sm text-muted-foreground">
                  Select from our pre-built bots for your industry
                </p>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link to="/dashboard/marketplace">Browse</Link>
              </Button>
            </div>

            <div className="flex items-start gap-4 rounded-lg border border-border p-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground">
                3
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-foreground">Configure & Launch</h4>
                <p className="text-sm text-muted-foreground">
                  Customize your bot messages and activate it
                </p>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link to="/dashboard/bot-config">Configure</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
