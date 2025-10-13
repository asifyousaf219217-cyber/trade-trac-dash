import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Database, Globe, Zap, Code, Sparkles } from "lucide-react";

const About = () => {
  const technologies = [
    { name: "React", icon: "⚛️" },
    { name: "TypeScript", icon: "📘" },
    { name: "Tailwind CSS", icon: "🎨" },
    { name: "Recharts", icon: "📊" },
    { name: "Shadcn UI", icon: "🎭" },
    { name: "Vite", icon: "⚡" },
  ];

  const features = [
    {
      icon: <Database className="h-8 w-8" />,
      title: "Real-Time Data",
      description: "Live market data powered by industry-leading financial APIs",
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "Market Analytics",
      description: "Comprehensive analysis of stocks, sectors, and trends",
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: "Global Coverage",
      description: "Track markets and currencies from around the world",
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Fast & Responsive",
      description: "Lightning-fast performance optimized for all devices",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-6">
          <TrendingUp className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-5xl font-bold mb-4">About StockPulse</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          A comprehensive financial insights platform designed to help investors and enthusiasts stay informed about global markets
        </p>
      </div>

      {/* Project Description */}
      <Card className="mb-12 border-primary/20">
        <CardContent className="p-8">
          <div className="flex items-start space-x-4 mb-6">
            <Sparkles className="h-6 w-6 text-primary mt-1" />
            <div>
              <h2 className="text-2xl font-bold mb-4">The Vision</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                StockPulse was created as part of the Creative Computing course to demonstrate the integration of modern web technologies with real-time financial data APIs. The platform brings together stock market data, currency exchange rates, market trends, and financial news into a single, intuitive dashboard.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Built with a focus on user experience and performance, StockPulse showcases how modern web development tools can create powerful, data-driven applications that provide real value to users interested in financial markets.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features Grid */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold mb-8 text-center">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="hover-lift">
              <CardContent className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary/10 text-primary mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Technologies */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold mb-8 text-center">Technologies Used</h2>
        <Card>
          <CardContent className="p-8">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {technologies.map((tech, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center space-y-3 p-4 rounded-lg hover:bg-accent transition-colors"
                >
                  <span className="text-4xl">{tech.icon}</span>
                  <span className="font-medium text-sm">{tech.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* APIs & Data Sources */}
      <Card className="mb-12">
        <CardContent className="p-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <Code className="h-6 w-6 mr-2 text-primary" />
            Data Sources & APIs
          </h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Badge variant="outline">Stock Data</Badge>
              <p className="text-muted-foreground">
                Alpha Vantage, Twelve Data, Finnhub.io
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <Badge variant="outline">Currency Rates</Badge>
              <p className="text-muted-foreground">
                ExchangeRate.host, Frankfurter API
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <Badge variant="outline">Financial News</Badge>
              <p className="text-muted-foreground">NewsAPI.org</p>
            </div>
            <div className="flex items-start space-x-3">
              <Badge variant="outline">Cryptocurrency</Badge>
              <p className="text-muted-foreground">CoinGecko API</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Info */}
      <Card className="bg-gradient-to-br from-primary/10 to-chart-1/10 border-primary/20">
        <CardContent className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Project Details</h2>
          <div className="space-y-2 text-muted-foreground">
            <p>
              <strong className="text-foreground">Created by:</strong> Asif
            </p>
            <p>
              <strong className="text-foreground">Course:</strong> Creative Computing
            </p>
            <p>
              <strong className="text-foreground">Purpose:</strong> Academic Project & Portfolio Demonstration
            </p>
            <p className="mt-6 text-sm">
              This project demonstrates the integration of modern web technologies with real-time financial data APIs to create a comprehensive market insights platform.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default About;
