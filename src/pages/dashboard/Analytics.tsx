import { BarChart3, TrendingUp, MessageSquare, ShoppingCart, Calendar, Sparkles, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useAnalytics } from "@/hooks/useAnalytics";

export default function Analytics() {
  const { data: analytics, isLoading } = useAnalytics();

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const messagesData = analytics?.messagesData || [];
  const ordersData = analytics?.ordersData || [];
  const appointmentsData = analytics?.appointmentsData || [];
  const aiVsStaticData = analytics?.aiVsStatic || [
    { name: 'Bot Responses', value: 0, color: 'hsl(142, 70%, 45%)' },
    { name: 'Human Responses', value: 0, color: 'hsl(210, 20%, 80%)' },
  ];

  const totalMessages = analytics?.totalMessages || 0;
  const totalOrders = analytics?.totalOrders || 0;
  const totalAppointments = analytics?.totalAppointments || 0;
  const botResponses = aiVsStaticData[0]?.value || 0;
  const humanResponses = aiVsStaticData[1]?.value || 0;
  const totalResponses = botResponses + humanResponses;
  const aiAccuracy = totalResponses > 0 ? Math.round((botResponses / totalResponses) * 100) : 0;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-accent p-2">
            <BarChart3 className="h-5 w-5 text-accent-foreground" />
          </div>
          <div>
            <h1 className="page-title">Analytics</h1>
            <p className="page-description">Track your bot's performance and engagement (last 7 days)</p>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Messages"
          value={totalMessages.toString()}
          description="This week"
          icon={MessageSquare}
          trend={{ value: 0, isPositive: true }}
        />
        <StatCard
          title="Total Orders"
          value={totalOrders.toString()}
          description="This week"
          icon={ShoppingCart}
          trend={{ value: 0, isPositive: true }}
        />
        <StatCard
          title="Appointments"
          value={totalAppointments.toString()}
          description="This week"
          icon={Calendar}
          trend={{ value: 0, isPositive: true }}
        />
        <StatCard
          title="Bot Response Rate"
          value={`${aiAccuracy}%`}
          description="Bot vs Human"
          icon={TrendingUp}
          trend={{ value: 0, isPositive: true }}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Messages Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              Messages per Day
            </CardTitle>
            <CardDescription>Daily message volume this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {messagesData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={messagesData}>
                    <defs>
                      <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(142, 70%, 45%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(142, 70%, 45%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="messages"
                      stroke="hsl(142, 70%, 45%)"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorMessages)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  No message data yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Orders Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-primary" />
              Orders per Day
            </CardTitle>
            <CardDescription>Daily orders received this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {ordersData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ordersData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="orders" fill="hsl(142, 70%, 45%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  No order data yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Appointments Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Appointments per Day
            </CardTitle>
            <CardDescription>Daily appointments booked this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {appointmentsData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={appointmentsData}>
                    <defs>
                      <linearGradient id="colorAppointments" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="appointments"
                      stroke="hsl(199, 89%, 48%)"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorAppointments)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  No appointment data yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* AI vs Static */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Bot vs Human Replies
            </CardTitle>
            <CardDescription>Response type distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {totalResponses > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={aiVsStaticData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {aiVsStaticData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  No response data yet
                </div>
              )}
            </div>
            <div className="mt-4 flex justify-center gap-6">
              {aiVsStaticData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-muted-foreground">
                    {item.name}: {item.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
