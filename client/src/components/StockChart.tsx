import { useState, useEffect, useRef } from "react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";

type TimeframeOption = "1D" | "1W" | "1M" | "3M" | "1Y" | "All";

type StockChartProps = {
  symbol: string;
  isLoading: boolean;
  data?: {
    date: string;
    value: number;
  }[];
};

export function StockChart({ symbol, isLoading, data = [] }: StockChartProps) {
  const [timeframe, setTimeframe] = useState<TimeframeOption>("1M");
  const { theme } = useTheme();
  
  const chartRef = useRef<HTMLDivElement>(null);
  
  // Format chart data
  const chartData = Array.isArray(data) && data.length > 0 ? data.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    price: item.value
  })) : [];
  
  // Handle timeframe change
  const handleTimeframeChange = (newTimeframe: TimeframeOption) => {
    setTimeframe(newTimeframe);
    // In a real application, this would trigger a new data fetch
  };
  
  const timeframeOptions: TimeframeOption[] = ["1D", "1W", "1M", "3M", "1Y", "All"];
  
  // Calculate chart colors based on performance
  const isPositive = chartData.length >= 2 && 
    (chartData[chartData.length - 1]?.price || 0) >= (chartData[0]?.price || 0);
  
  const chartColor = isPositive ? "#00C853" : "#FF3D00";
  const chartColorTransparent = isPositive ? "rgba(0, 200, 83, 0.1)" : "rgba(255, 61, 0, 0.1)";
  
  // Format tooltip data
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-md shadow-md p-2 text-sm">
          <p className="font-medium">{label}</p>
          <p className="font-mono">${payload[0].value.toFixed(2)}</p>
        </div>
      );
    }
    return null;
  };
  
  // Responsive resizing
  useEffect(() => {
    const handleResize = () => {
      if (chartRef.current) {
        // Force recharts to recalculate dimensions
        const event = new Event('resize');
        window.dispatchEvent(event);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return (
    <Card className="mb-6">
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="text-base font-medium">Price Chart</CardTitle>
          <div className="flex space-x-1">
            {timeframeOptions.map((option) => (
              <Button
                key={option}
                variant={timeframe === option ? "default" : "ghost"}
                size="sm"
                className="text-xs px-2 py-1 h-7"
                onClick={() => handleTimeframeChange(option)}
              >
                {option}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div ref={chartRef} className="h-[300px] w-full">
          {isLoading ? (
            <div className="h-full w-full flex items-center justify-center bg-muted animate-pulse">
              <p className="text-muted-foreground">Loading chart data...</p>
            </div>
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColor} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  vertical={false} 
                  stroke={theme === "dark" ? "#333" : "#eee"} 
                />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 10 }} 
                  tickLine={false} 
                  axisLine={false} 
                  tickMargin={10} 
                />
                <YAxis 
                  domain={['auto', 'auto']} 
                  tick={{ fontSize: 10 }} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(value) => `$${value.toFixed(2)}`} 
                  tickMargin={10} 
                  width={60}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="price" 
                  stroke={chartColor} 
                  fillOpacity={1}
                  fill="url(#colorPrice)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <p className="text-muted-foreground">No chart data available for {symbol}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
