import { TrendingUp, TrendingDown } from "lucide-react";

const tickerData = [
  { symbol: "AAPL", change: 2.4, positive: true },
  { symbol: "TSLA", change: -1.3, positive: false },
  { symbol: "BTC", change: 0.7, positive: true },
  { symbol: "GOOGL", change: 1.8, positive: true },
  { symbol: "AMZN", change: -0.5, positive: false },
  { symbol: "MSFT", change: 1.2, positive: true },
  { symbol: "META", change: 3.1, positive: true },
  { symbol: "NVDA", change: 2.9, positive: true },
];

const Ticker = () => {
  return (
    <div className="w-full bg-muted border-b overflow-hidden">
      <div className="flex animate-ticker space-x-8 py-2">
        {[...tickerData, ...tickerData].map((stock, index) => (
          <div
            key={`${stock.symbol}-${index}`}
            className="flex items-center space-x-2 whitespace-nowrap"
          >
            <span className="font-semibold text-sm">{stock.symbol}</span>
            <span
              className={`flex items-center text-xs font-medium ${
                stock.positive ? "text-success" : "text-destructive"
              }`}
            >
              {stock.positive ? (
                <TrendingUp className="h-3 w-3 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1" />
              )}
              {stock.positive ? "+" : ""}
              {stock.change}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Ticker;
