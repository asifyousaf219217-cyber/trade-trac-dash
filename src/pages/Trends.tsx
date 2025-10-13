import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Flame } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import StockCard from "@/components/StockCard";

const Trends = () => {
  const trendingStocks = [
    { symbol: "NVDA", name: "NVIDIA Corp", price: 495.30, change: 5.2, volume: "125M" },
    { symbol: "META", name: "Meta Platforms", price: 352.80, change: 3.1, volume: "85M" },
    { symbol: "TSLA", name: "Tesla Inc.", price: 242.80, change: 8.4, volume: "198M" },
    { symbol: "AAPL", name: "Apple Inc.", price: 178.45, change: 2.3, volume: "152M" },
    { symbol: "AMD", name: "AMD Inc.", price: 165.40, change: 4.5, volume: "142M" },
  ];

  const sectorData = [
    { sector: "Technology", performance: 5.2, color: "hsl(var(--chart-1))" },
    { sector: "Healthcare", performance: 2.8, color: "hsl(var(--chart-2))" },
    { sector: "Finance", performance: 1.4, color: "hsl(var(--chart-4))" },
    { sector: "Consumer", performance: 0.9, color: "hsl(var(--chart-5))" },
    { sector: "Industrial", performance: -0.5, color: "hsl(var(--chart-3))" },
    { sector: "Energy", performance: -1.8, color: "hsl(var(--destructive))" },
  ];

  const cryptoData = [
    { name: "Bitcoin", symbol: "BTC", price: 43250, change: 2.4, icon: "₿" },
    { name: "Ethereum", symbol: "ETH", price: 2280, change: 1.8, icon: "Ξ" },
    { name: "Dogecoin", symbol: "DOGE", price: 0.082, change: -0.5, icon: "Ð" },
  ];

  const marketInsights = [
    {
      title: "Tech Rally Continues",
      description: "Technology sector leads market gains with AI stocks surging",
      badge: "Hot",
    },
    {
      title: "Fed Rate Decision",
      description: "Markets anticipate Federal Reserve interest rate announcement",
      badge: "News",
    },
    {
      title: "Green Energy Boom",
      description: "Renewable energy stocks see increased investor interest",
      badge: "Trending",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center">
          <Flame className="h-10 w-10 mr-3 text-chart-4" />
          Market Trends
        </h1>
        <p className="text-muted-foreground">What's hot in the market right now</p>
      </div>

      {/* Market Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {marketInsights.map((insight, index) => (
          <Card key={index} className="hover-lift">
            <CardContent className="p-6">
              <Badge className="mb-3">{insight.badge}</Badge>
              <h3 className="text-xl font-bold mb-2">{insight.title}</h3>
              <p className="text-muted-foreground">{insight.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Trending Stocks */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <TrendingUp className="h-6 w-6 mr-2 text-success" />
          Trending Stocks
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {trendingStocks.map((stock) => (
            <StockCard key={stock.symbol} {...stock} />
          ))}
        </div>
      </div>

      {/* Sector Performance Chart */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Sector Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={sectorData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
              <YAxis dataKey="sector" type="category" stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="performance" fill="hsl(var(--primary))" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Cryptocurrency Prices */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Cryptocurrency Prices</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cryptoData.map((crypto) => {
            const isPositive = crypto.change >= 0;
            return (
              <Card key={crypto.symbol} className="hover-lift">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                        {crypto.icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{crypto.name}</h3>
                        <p className="text-sm text-muted-foreground">{crypto.symbol}</p>
                      </div>
                    </div>
                    {isPositive ? (
                      <TrendingUp className="h-6 w-6 text-success" />
                    ) : (
                      <TrendingDown className="h-6 w-6 text-destructive" />
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-2xl font-bold">
                      ${crypto.price.toLocaleString()}
                    </div>
                    <div
                      className={`flex items-center text-sm font-medium ${
                        isPositive ? "text-success" : "text-destructive"
                      }`}
                    >
                      {isPositive ? (
                        <TrendingUp className="h-4 w-4 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 mr-1" />
                      )}
                      {isPositive ? "+" : ""}
                      {crypto.change}%
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Trends;
