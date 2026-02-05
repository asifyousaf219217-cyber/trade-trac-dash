import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  MessageSquare,
  Bot,
  Settings,
  ShoppingCart,
  Calendar,
  BarChart3,
  Smartphone,
  Sparkles,
  Store,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
 import { useBusiness } from "@/hooks/useBusiness";

 // User-friendly navigation labels
const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
   { name: "WhatsApp", href: "/dashboard/whatsapp", icon: Smartphone },
   { name: "Templates", href: "/dashboard/marketplace", icon: Store },
   { name: "Chatbot Setup", href: "/dashboard/bot-config", icon: Bot },
   { name: "Smart Replies", href: "/dashboard/ai-settings", icon: Sparkles },
   { name: "Live Chat", href: "/dashboard/live-chat", icon: MessageSquare },
  { name: "Orders", href: "/dashboard/orders", icon: ShoppingCart },
  { name: "Appointments", href: "/dashboard/appointments", icon: Calendar },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function DashboardSidebar() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
   const { data: business } = useBusiness();
 
   // Get initials for avatar
   const getInitials = () => {
     const name = business?.name || "";
     if (!name) return "WB";
     const words = name.split(" ");
     if (words.length >= 2) {
       return (words[0][0] + words[1][0]).toUpperCase();
     }
     return name.substring(0, 2).toUpperCase();
   };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="fixed left-4 top-4 z-50 rounded-lg bg-sidebar p-2 text-sidebar-foreground lg:hidden"
      >
        {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-sidebar transition-transform duration-300 lg:translate-x-0",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
      {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sidebar-primary to-sidebar-primary/80 shadow-lg">
            <MessageSquare className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-sidebar-foreground">Whatsbott</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "sidebar-item",
                  isActive ? "sidebar-item-active" : "sidebar-item-inactive"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-primary text-sm font-medium text-sidebar-primary-foreground">
             {getInitials()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium text-sidebar-foreground">
               {business?.name || "Your Business"}
              </p>
              <p className="truncate text-xs text-sidebar-muted">Free Plan</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
