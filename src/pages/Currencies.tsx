import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, TrendingUp, TrendingDown } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const Currencies = () => {
  const [amount, setAmount] = useState("1000");
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("AED");

  const currencies = [
    { code: "USD", name: "US Dollar", flag: "🇺🇸", rate: 1.0000 },
    { code: "EUR", name: "Euro", flag: "🇪🇺", rate: 0.9245 },
    { code: "GBP", name: "British Pound", flag: "🇬🇧", rate: 0.7892 },
    { code: "AED", name: "UAE Dirham", flag: "🇦🇪", rate: 3.6725 },
    { code: "JPY", name: "Japanese Yen", flag: "🇯🇵", rate: 149.32 },
    { code: "CAD", name: "Canadian Dollar", flag: "🇨🇦", rate: 1.3542 },
    { code: "AUD", name: "Australian Dollar", flag: "🇦🇺", rate: 1.5287 },
    { code: "CHF", name: "Swiss Franc", flag: "🇨🇭", rate: 0.8845 },
  ];

  const chartData = [
    { date: "Mon", rate: 3.65 },
    { date: "Tue", rate: 3.66 },
    { date: "Wed", rate: 3.67 },
    { date: "Thu", rate: 3.68 },
    { date: "Fri", rate: 3.67 },
    { date: "Sat", rate: 3.67 },
    { date: "Sun", rate: 3.67 },
  ];

  const calculateConversion = () => {
    const fromRate = currencies.find((c) => c.code === fromCurrency)?.rate || 1;
    const toRate = currencies.find((c) => c.code === toCurrency)?.rate || 1;
    const numAmount = parseFloat(amount) || 0;
    return ((numAmount / fromRate) * toRate).toFixed(2);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Currency Exchange</h1>
        <p className="text-muted-foreground">Live forex rates and currency converter</p>
      </div>

      {/* Currency Converter */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Currency Converter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="h-12 text-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="from">From</Label>
              <Select value={fromCurrency} onValueChange={setFromCurrency}>
                <SelectTrigger id="from" className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      <span className="flex items-center space-x-2">
                        <span>{currency.flag}</span>
                        <span>{currency.code}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="to">To</Label>
              <Select value={toCurrency} onValueChange={setToCurrency}>
                <SelectTrigger id="to" className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      <span className="flex items-center space-x-2">
                        <span>{currency.flag}</span>
                        <span>{currency.code}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-8 p-6 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-center justify-center space-x-4 text-2xl font-bold">
              <span>
                {amount} {fromCurrency}
              </span>
              <ArrowRight className="h-6 w-6 text-primary" />
              <span className="text-primary">
                {calculateConversion()} {toCurrency}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exchange Rate Chart */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>
            USD → AED Exchange Rate (Last 7 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" domain={[3.64, 3.69]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Line
                type="monotone"
                dataKey="rate"
                stroke="hsl(var(--success))"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Currency Grid */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Live Exchange Rates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {currencies.map((currency) => {
            const change = (Math.random() * 2 - 1).toFixed(2);
            const isPositive = parseFloat(change) >= 0;

            return (
              <Card key={currency.code} className="hover-lift">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl">{currency.flag}</span>
                      <div>
                        <h3 className="font-bold text-lg">{currency.code}</h3>
                        <p className="text-sm text-muted-foreground">{currency.name}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-2xl font-bold">{currency.rate.toFixed(4)}</div>
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
                      {change}%
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

export default Currencies;
