import { TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StockCardProps {
  symbol: string;
  name: string;
  price: number;
  change: number;
  volume?: string;
}

const StockCard = ({ symbol, name, price, change, volume }: StockCardProps) => {
  const isPositive = change >= 0;

  return (
    <Card className="hover-lift cursor-pointer group">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold mb-1">{symbol}</h3>
            <p className="text-sm text-muted-foreground">{name}</p>
          </div>
          {isPositive ? (
            <TrendingUp className="h-6 w-6 text-success" />
          ) : (
            <TrendingDown className="h-6 w-6 text-destructive" />
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold">${price.toFixed(2)}</span>
            <span
              className={`text-lg font-semibold flex items-center ${
                isPositive ? "text-success" : "text-destructive"
              }`}
            >
              {isPositive ? "+" : ""}
              {change.toFixed(2)}%
            </span>
          </div>
          
          {volume && (
            <p className="text-sm text-muted-foreground">
              Volume: {volume}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StockCard;
