import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Search, TrendingUp, TrendingDown } from "lucide-react";
import StockCard from "@/components/StockCard";

const Markets = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const stocks = {
    gainers: [
      { symbol: "NVDA", name: "NVIDIA Corp", price: 495.30, change: 5.2, volume: "125M" },
      { symbol: "META", name: "Meta Platforms", price: 352.80, change: 3.1, volume: "85M" },
      { symbol: "AAPL", name: "Apple Inc.", price: 178.45, change: 2.3, volume: "52M" },
      { symbol: "GOOGL", name: "Alphabet Inc.", price: 142.60, change: 1.8, volume: "45M" },
    ],
    losers: [
      { symbol: "TSLA", name: "Tesla Inc.", price: 242.80, change: -2.4, volume: "98M" },
      { symbol: "NFLX", name: "Netflix Inc.", price: 485.20, change: -1.9, volume: "38M" },
      { symbol: "AMZN", name: "Amazon.com", price: 148.92, change: -0.8, volume: "45M" },
      { symbol: "AMD", name: "AMD Inc.", price: 165.40, change: -0.5, volume: "72M" },
    ],
    active: [
      { symbol: "TSLA", name: "Tesla Inc.", price: 242.80, change: -2.4, volume: "198M" },
      { symbol: "NVDA", name: "NVIDIA Corp", price: 495.30, change: 5.2, volume: "175M" },
      { symbol: "AAPL", name: "Apple Inc.", price: 178.45, change: 2.3, volume: "152M" },
      { symbol: "AMD", name: "AMD Inc.", price: 165.40, change: -0.5, volume: "142M" },
    ],
  };

  const chartData = [
    { time: "9:30", price: 172 },
    { time: "10:00", price: 174 },
    { time: "10:30", price: 173 },
    { time: "11:00", price: 176 },
    { time: "11:30", price: 175 },
    { time: "12:00", price: 178 },
    { time: "12:30", price: 177 },
    { time: "1:00", price: 179 },
  ];

  const sectors = [
    { name: "Technology", change: 2.8, positive: true },
    { name: "Healthcare", change: 1.4, positive: true },
    { name: "Finance", change: 0.9, positive: true },
    { name: "Energy", change: -1.2, positive: false },
    { name: "Consumer", change: 0.5, positive: true },
    { name: "Industrial", change: -0.3, positive: false },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Stock Markets</h1>
        <p className="text-muted-foreground">Real-time market data and analysis</p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search stocks by name or symbol (e.g., AAPL, Tesla)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-12 text-lg"
        />
      </div>

      {/* Featured Stock Chart */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div>
              <span className="text-3xl font-bold">AAPL</span>
              <span className="text-muted-foreground ml-3">Apple Inc.</span>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">$178.45</div>
              <div className="text-success flex items-center justify-end">
                <TrendingUp className="h-5 w-5 mr-1" />
                +2.3%
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Sector Performance */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Sector Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {sectors.map((sector) => (
              <div
                key={sector.name}
                className="p-4 rounded-lg border bg-card hover-lift"
              >
                <p className="text-sm font-medium mb-2">{sector.name}</p>
                <p
                  className={`text-lg font-bold flex items-center ${
                    sector.positive ? "text-success" : "text-destructive"
                  }`}
                >
                  {sector.positive ? (
                    <TrendingUp className="h-4 w-4 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 mr-1" />
                  )}
                  {sector.positive ? "+" : ""}
                  {sector.change}%
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stock Lists */}
      <Tabs defaultValue="gainers" className="space-y-6">
        <TabsList className="grid w-full md:w-auto grid-cols-3">
          <TabsTrigger value="gainers">Top Gainers</TabsTrigger>
          <TabsTrigger value="losers">Top Losers</TabsTrigger>
          <TabsTrigger value="active">Most Active</TabsTrigger>
        </TabsList>

        <TabsContent value="gainers">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stocks.gainers.map((stock) => (
              <StockCard key={stock.symbol} {...stock} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="losers">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stocks.losers.map((stock) => (
              <StockCard key={stock.symbol} {...stock} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="active">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stocks.active.map((stock) => (
              <StockCard key={stock.symbol} {...stock} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Markets;
