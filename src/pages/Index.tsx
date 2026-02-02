import { Link } from "react-router-dom";
import { MessageSquare, Bot, BarChart3, ShoppingCart, ArrowRight, Check, Zap, Shield, Globe, Clock, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

const features = [
  {
    icon: Bot,
    title: "Smart AI Bots",
    description: "Pre-built bots for restaurants, salons, e-commerce, and customer support.",
  },
  {
    icon: MessageSquare,
    title: "WhatsApp Integration",
    description: "Connect your WhatsApp Business account seamlessly in minutes.",
  },
  {
    icon: ShoppingCart,
    title: "Order Management",
    description: "Track orders and appointments from a unified dashboard.",
  },
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    description: "Monitor performance with detailed insights and conversion reports.",
  },
  {
    icon: Zap,
    title: "Instant Responses",
    description: "Reply to customers instantly, even when you're away.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-grade encryption keeps your conversations secure.",
  },
];

const benefits = [
  { text: "24/7 automated customer support", icon: Clock },
  { text: "No coding required", icon: Sparkles },
  { text: "AI-powered responses with Gemini", icon: Bot },
  { text: "Multi-language support", icon: Globe },
  { text: "Order and appointment tracking", icon: ShoppingCart },
  { text: "Team collaboration tools", icon: Users },
];

const stats = [
  { value: "10M+", label: "Messages Sent" },
  { value: "5,000+", label: "Active Businesses" },
  { value: "99.9%", label: "Uptime" },
  { value: "<2s", label: "Response Time" },
];

const typingMessages = [
  "Hi! I'd like to order a pizza 🍕",
  "Can I book an appointment for tomorrow?",
  "What's the status of my order?",
  "Do you have any availability this weekend?",
];

export default function Index() {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  // Typing animation effect
  useEffect(() => {
    const currentMessage = typingMessages[currentMessageIndex];
    
    if (isTyping) {
      if (displayedText.length < currentMessage.length) {
        const timeout = setTimeout(() => {
          setDisplayedText(currentMessage.slice(0, displayedText.length + 1));
        }, 50);
        return () => clearTimeout(timeout);
      } else {
        const timeout = setTimeout(() => {
          setIsTyping(false);
        }, 2000);
        return () => clearTimeout(timeout);
      }
    } else {
      const timeout = setTimeout(() => {
        setDisplayedText("");
        setCurrentMessageIndex((prev) => (prev + 1) % typingMessages.length);
        setIsTyping(true);
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [displayedText, isTyping, currentMessageIndex]);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg transition-transform group-hover:scale-110">
              <MessageSquare className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Whatsbott
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" className="hidden sm:flex">Sign In</Button>
            </Link>
            <Link to="/signup">
              <Button className="gap-2 shadow-lg hover:shadow-xl transition-shadow">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-accent/20 blur-3xl animate-pulse delay-700" />
        </div>
        
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-sm text-muted-foreground mb-6">
                <Sparkles className="h-4 w-4 text-primary" />
                <span>Now with Gemini AI Integration</span>
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Automate Your
                <span className="block bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
                  WhatsApp Business
                </span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground lg:text-xl max-w-xl mx-auto lg:mx-0">
                Deploy intelligent chatbots that handle orders, appointments, and customer inquiries 24/7. 
                No coding required.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
                <Link to="/signup">
                  <Button size="lg" className="gap-2 px-8 shadow-lg hover:shadow-xl transition-all hover:scale-105">
                    Start Free Trial
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
                    </span>
                    Watch Demo
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Interactive Chat Demo */}
            <div className="relative">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-2xl">
                <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border">
                  <div className="h-3 w-3 rounded-full bg-destructive/60" />
                  <div className="h-3 w-3 rounded-full bg-warning/60" />
                  <div className="h-3 w-3 rounded-full bg-success/60" />
                  <span className="ml-2 text-sm text-muted-foreground">Live Preview</span>
                </div>
                <div className="space-y-4 min-h-[280px]">
                  {/* Incoming message with typing animation */}
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary">
                      <span className="text-xs">👤</span>
                    </div>
                    <div className="chat-bubble-incoming">
                      {displayedText}
                      {isTyping && <span className="inline-block w-0.5 h-4 bg-foreground ml-1 animate-pulse" />}
                    </div>
                  </div>
                  
                  {/* Bot responses */}
                  {displayedText.length > 10 && (
                    <div className="flex items-start gap-3 animate-in slide-in-from-bottom-2">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary">
                        <Bot className="h-4 w-4 text-primary-foreground" />
                      </div>
                      <div className="chat-bubble-outgoing">
                        <div className="flex items-center gap-2">
                          <span className="inline-block h-2 w-2 rounded-full bg-primary-foreground/60 animate-bounce" />
                          <span className="inline-block h-2 w-2 rounded-full bg-primary-foreground/60 animate-bounce delay-100" />
                          <span className="inline-block h-2 w-2 rounded-full bg-primary-foreground/60 animate-bounce delay-200" />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {displayedText === typingMessages[currentMessageIndex] && (
                    <div className="flex items-start gap-3 animate-in slide-in-from-bottom-2 duration-500">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary">
                        <Bot className="h-4 w-4 text-primary-foreground" />
                      </div>
                      <div className="chat-bubble-outgoing">
                        Got it! Let me help you with that right away. ✨
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {/* Floating badges */}
              <div className="absolute -top-4 -right-4 rounded-full bg-success/90 px-3 py-1 text-xs font-medium text-success-foreground shadow-lg animate-bounce">
                AI Powered
              </div>
              <div className="absolute -bottom-4 -left-4 rounded-full bg-primary/90 px-3 py-1 text-xs font-medium text-primary-foreground shadow-lg">
                Instant Replies
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-secondary/30 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <div 
                key={stat.label} 
                className="text-center group cursor-default"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-3xl font-bold text-primary transition-transform group-hover:scale-110 lg:text-4xl">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground lg:text-4xl">
              Everything You Need to Scale
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              A complete platform to automate your WhatsApp business communications
            </p>
          </div>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
                className={`rounded-2xl border border-border bg-card p-6 transition-all duration-300 cursor-default ${
                  hoveredFeature === index 
                    ? 'shadow-xl scale-105 border-primary/50' 
                    : 'hover:shadow-md'
                }`}
              >
                <div className={`flex h-14 w-14 items-center justify-center rounded-xl transition-colors duration-300 ${
                  hoveredFeature === index ? 'bg-primary' : 'bg-accent'
                }`}>
                  <feature.icon className={`h-7 w-7 transition-colors duration-300 ${
                    hoveredFeature === index ? 'text-primary-foreground' : 'text-accent-foreground'
                  }`} />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold text-foreground lg:text-4xl">
                Why Businesses Choose Whatsbott
              </h2>
              <p className="mt-4 text-muted-foreground text-lg">
                Join thousands of businesses automating their WhatsApp communications.
              </p>
              <div className="mt-8 grid gap-4">
                {benefits.map((benefit, index) => (
                  <div 
                    key={benefit.text} 
                    className="flex items-center gap-3 p-3 rounded-xl bg-background/50 border border-border/50 transition-all hover:border-primary/30 hover:shadow-sm cursor-default group"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <benefit.icon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="font-medium text-foreground">{benefit.text}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <Link to="/signup">
                  <Button size="lg" className="gap-2 shadow-lg hover:shadow-xl transition-all">
                    Get Started Free
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Interactive demo card */}
            <div className="relative">
              <div className="rounded-2xl border border-border bg-card p-8 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-foreground">Today's Overview</h3>
                  <span className="text-xs text-muted-foreground">Live</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-primary/10 p-4 transition-transform hover:scale-105 cursor-default">
                    <div className="text-2xl font-bold text-primary">247</div>
                    <div className="text-sm text-muted-foreground">Messages</div>
                  </div>
                  <div className="rounded-xl bg-success/10 p-4 transition-transform hover:scale-105 cursor-default">
                    <div className="text-2xl font-bold text-success">98%</div>
                    <div className="text-sm text-muted-foreground">Response Rate</div>
                  </div>
                  <div className="rounded-xl bg-accent/30 p-4 transition-transform hover:scale-105 cursor-default">
                    <div className="text-2xl font-bold text-accent-foreground">52</div>
                    <div className="text-sm text-muted-foreground">Orders</div>
                  </div>
                  <div className="rounded-xl bg-warning/10 p-4 transition-transform hover:scale-105 cursor-default">
                    <div className="text-2xl font-bold text-warning">18</div>
                    <div className="text-sm text-muted-foreground">Appointments</div>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-border">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Customer Satisfaction</span>
                    <span className="font-semibold text-foreground">4.9/5 ⭐</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full w-[98%] rounded-full bg-gradient-to-r from-primary to-success animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
        <div className="container relative mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-primary-foreground lg:text-4xl">
            Ready to Transform Your Business?
          </h2>
          <p className="mt-4 text-primary-foreground/80 text-lg max-w-xl mx-auto">
            Start your 14-day free trial today. No credit card required. 
            Set up in under 5 minutes.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to="/signup">
              <Button size="lg" variant="secondary" className="gap-2 shadow-lg hover:shadow-xl transition-all hover:scale-105">
                Get Started Now
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <p className="mt-6 text-sm text-primary-foreground/60">
            Trusted by 5,000+ businesses worldwide
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg">
                <MessageSquare className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">Whatsbott</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors">Contact</a>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Whatsbott. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
