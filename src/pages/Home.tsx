import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StockCard from "@/components/StockCard";
import { ArrowRight, TrendingUp, DollarSign, Globe } from "lucide-react";
import { Link } from "react-router-dom";

const Home = () => {
  const topStocks = [
    { symbol: "AAPL", name: "Apple Inc.", price: 178.45, change: 2.3, volume: "52.3M" },
    { symbol: "TSLA", name: "Tesla Inc.", price: 242.80, change: -1.4, volume: "98.1M" },
    { symbol: "AMZN", name: "Amazon.com", price: 148.92, change: 0.8, volume: "45.2M" },
  ];

  const currencies = [
    { from: "USD", to: "EUR", rate: 0.92 },
    { from: "GBP", to: "USD", rate: 1.27 },
    { from: "AED", to: "USD", rate: 0.27 },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-10" />
        <div className="container mx-auto px-4 py-24 relative">
          <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              Stay Ahead of the Market
              <span className="block mt-2 bg-gradient-to-r from-primary via-chart-1 to-chart-4 bg-clip-text text-transparent">
                with Real-Time Insights
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Access live stock data, currency rates, market trends, and financial news in one powerful dashboard
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/markets">
                <Button size="lg" className="group">
                  Explore Markets
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/about">
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Market Overview */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Market Overview</h2>
            <p className="text-muted-foreground">Today's top movers in the market</p>
          </div>
          <Link to="/markets">
            <Button variant="ghost">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {topStocks.map((stock) => (
            <StockCard key={stock.symbol} {...stock} />
          ))}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glassmorphism">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Markets</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">500+</div>
              <p className="text-xs text-muted-foreground mt-1">
                Global stock exchanges
              </p>
            </CardContent>
          </Card>

          <Card className="glassmorphism">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Currencies Tracked</CardTitle>
              <DollarSign className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">150+</div>
              <p className="text-xs text-muted-foreground mt-1">
                Live exchange rates
              </p>
            </CardContent>
          </Card>

          <Card className="glassmorphism">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">News Sources</CardTitle>
              <Globe className="h-4 w-4 text-chart-4" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">100+</div>
              <p className="text-xs text-muted-foreground mt-1">
                Financial news outlets
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Currency Panel */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Live Currency Rates</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {currencies.map((currency) => (
              <Card key={`${currency.from}-${currency.to}`} className="hover-lift">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold">{currency.from}</span>
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                      <span className="text-2xl font-bold">{currency.to}</span>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-primary">
                    {currency.rate.toFixed(4)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Live exchange rate
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/currencies">
              <Button variant="outline">
                View All Currencies
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
