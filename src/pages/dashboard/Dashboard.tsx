import { MessageSquare, ShoppingCart, Calendar, Smartphone, Bot, Sparkles } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-description">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Connection Status Cards */}
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">WhatsApp Status</CardTitle>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <StatusBadge variant="warning">Not Connected</StatusBadge>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Connect your WhatsApp Business number
            </p>
            <Button asChild variant="outline" size="sm" className="mt-3">
              <Link to="/dashboard/whatsapp">Connect Now</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Bot Status</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <StatusBadge variant="inactive">Inactive</StatusBadge>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Select and configure your bot
            </p>
            <Button asChild variant="outline" size="sm" className="mt-3">
              <Link to="/dashboard/marketplace">Choose Bot</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">AI Mode</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <StatusBadge variant="default">Static Mode</StatusBadge>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Add Gemini API key for AI responses
            </p>
            <Button asChild variant="outline" size="sm" className="mt-3">
              <Link to="/dashboard/ai-settings">Enable AI</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Stats */}
      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Today's Stats</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Messages"
            value="0"
            description="Total messages today"
            icon={MessageSquare}
            trend={{ value: 0, isPositive: true }}
          />
          <StatCard
            title="Orders"
            value="0"
            description="Orders received"
            icon={ShoppingCart}
            trend={{ value: 0, isPositive: true }}
          />
          <StatCard
            title="Appointments"
            value="0"
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
