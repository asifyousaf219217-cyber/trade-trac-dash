import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Search, TrendingUp, TrendingDown } from "lucide-react";
import StockCard from "@/components/StockCard";
import { useStockQuote, useStockCandles } from "@/hooks/useStockQuote";
import { toast } from "sonner";

const Markets = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStock, setSelectedStock] = useState("AAPL");

  // Fetch real-time data for featured stock
  const { data: featuredQuote, isLoading: isLoadingQuote } = useStockQuote(selectedStock);
  const { data: candleData, isLoading: isLoadingCandles } = useStockCandles(selectedStock, "5");

  // Popular stocks to track
  const popularStocks = ["AAPL", "TSLA", "NVDA", "MSFT", "GOOGL", "META", "AMZN", "AMD"];

  // Transform candle data for chart
  const chartData = candleData?.c && candleData?.t
    ? candleData.c.slice(-20).map((price, index) => ({
        time: new Date(candleData.t[index] * 1000).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        price: price,
      }))
    : [];

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

      {/* Stock Selector */}
      <div className="mb-6 flex flex-wrap gap-2">
        {popularStocks.map((stock) => (
          <Button
            key={stock}
            variant={selectedStock === stock ? "default" : "outline"}
            onClick={() => setSelectedStock(stock)}
          >
            {stock}
          </Button>
        ))}
      </div>

      {/* Featured Stock Chart */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {isLoadingQuote ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
            ) : featuredQuote ? (
              <>
                <div>
                  <span className="text-3xl font-bold">{selectedStock}</span>
                  <span className="text-muted-foreground ml-3">Live Quote</span>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">${featuredQuote.c.toFixed(2)}</div>
                  <div
                    className={`flex items-center justify-end ${
                      featuredQuote.dp >= 0 ? "text-success" : "text-destructive"
                    }`}
                  >
                    {featuredQuote.dp >= 0 ? (
                      <TrendingUp className="h-5 w-5 mr-1" />
                    ) : (
                      <TrendingDown className="h-5 w-5 mr-1" />
                    )}
                    {featuredQuote.dp >= 0 ? "+" : ""}
                    {featuredQuote.dp.toFixed(2)}%
                  </div>
                </div>
              </>
            ) : (
              <div>No data available</div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingCandles ? (
            <Skeleton className="h-[300px] w-full" />
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))" 
                  domain={['auto', 'auto']}
                />
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
                  stroke={featuredQuote?.dp && featuredQuote.dp >= 0 ? "hsl(var(--success))" : "hsl(var(--destructive))"}
                  strokeWidth={3}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No chart data available
            </div>
          )}
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

      {/* Popular Stocks Grid */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Popular Stocks</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularStocks.map((symbol) => (
            <RealTimeStockCard key={symbol} symbol={symbol} />
          ))}
        </div>
      </div>
    </div>
  );
};

// Real-time stock card component
const RealTimeStockCard = ({ symbol }: { symbol: string }) => {
  const { data: quote, isLoading } = useStockQuote(symbol);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-6 w-20 mb-2" />
          <Skeleton className="h-4 w-32 mb-4" />
          <Skeleton className="h-8 w-24 mb-2" />
          <Skeleton className="h-4 w-16" />
        </CardContent>
      </Card>
    );
  }

  if (!quote) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">No data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <StockCard
      symbol={symbol}
      name={symbol}
      price={quote.c}
      change={quote.dp}
      volume={`${(quote.c * 1000000).toLocaleString()}`}
    />
  );
};

export default Markets;
