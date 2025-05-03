import { Stock } from "@/types/stock";
import { Button } from "@/components/ui/button";
import { LineChartIcon, DollarSignIcon, StarIcon } from "lucide-react";

type StockHeaderProps = {
  stock: Stock | null;
  isLoading: boolean;
};

export function StockHeader({ stock, isLoading }: StockHeaderProps) {
  if (isLoading) {
    return (
      <div className="mb-6 animate-pulse">
        <div className="h-8 w-48 bg-muted rounded mb-2"></div>
        <div className="h-6 w-32 bg-muted rounded"></div>
      </div>
    );
  }

  if (!stock) {
    return (
      <div className="mb-6">
        <div className="flex items-center">
          <h2 className="text-2xl font-bold mr-2">Select a Stock</h2>
        </div>
        <div className="text-muted-foreground">
          Search or select a stock from the watchlist to view details
        </div>
      </div>
    );
  }

  const isPositive = (stock.change || 0) >= 0;
  const priceChange = stock.change ? stock.change.toFixed(2) : "0.00";
  const priceChangePercent = stock.changePercent 
    ? stock.changePercent.toFixed(2) 
    : "0.00";

  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between">
        <div>
          <div className="flex items-center">
            <h2 className="text-2xl font-bold mr-2">{stock.symbol}</h2>
            <span className="text-muted-foreground">{stock.name}</span>
          </div>
          <div className="flex items-center mt-1">
            <span className="text-xl font-mono font-medium mr-2">
              ${stock.price?.toFixed(2) || "0.00"}
            </span>
            <span className={`${isPositive ? "text-profit bg-profit-10" : "text-loss bg-loss-10"} px-2 py-0.5 rounded font-medium text-sm`}>
              {isPositive ? "+" : ""}{priceChange} ({isPositive ? "+" : ""}{priceChangePercent}%)
            </span>
          </div>
        </div>

        <div className="flex space-x-2 mt-4 sm:mt-0">
          <Button variant="outline" size="sm" className="h-9">
            <LineChartIcon className="h-4 w-4 mr-1" /> Analysis
          </Button>
          <Button variant="outline" size="sm" className="h-9">
            <DollarSignIcon className="h-4 w-4 mr-1" /> Trade
          </Button>
          <Button variant="outline" size="sm" className="h-9">
            <StarIcon className="h-4 w-4 mr-1" /> Watch
          </Button>
        </div>
      </div>
    </div>
  );
}
