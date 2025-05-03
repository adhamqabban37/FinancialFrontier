import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardTitle 
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

type TechnicalSignal = {
  name: string;
  value: string | number;
  sentiment?: "bullish" | "bearish" | "neutral";
};

type TradingSignalData = {
  technicalAnalysis?: {
    recommendation?: string;
    score?: number;
    buy?: number;
    hold?: number;
    sell?: number;
  };
  signals?: TechnicalSignal[];
};

type TradingSignalsProps = {
  data: TradingSignalData | null;
  isLoading: boolean;
};

export function TradingSignals({ data, isLoading }: TradingSignalsProps) {
  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base font-medium">Trading Signals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="h-5 w-24 bg-muted rounded"></div>
              <div className="h-5 w-16 bg-muted rounded"></div>
            </div>
            <div className="h-2 w-full bg-muted rounded-full"></div>
            <div className="grid grid-cols-3 gap-4">
              <div className="h-16 bg-muted rounded"></div>
              <div className="h-16 bg-muted rounded"></div>
              <div className="h-16 bg-muted rounded"></div>
            </div>
            <div className="h-24 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default data if none is provided
  const analysis = data?.technicalAnalysis || {
    recommendation: "N/A",
    score: 50,
    buy: 0,
    hold: 0,
    sell: 0
  };

  const signals = data?.signals || [
    { name: "RSI (14)", value: "N/A" },
    { name: "MACD", value: "N/A" },
    { name: "Bollinger Bands", value: "N/A" }
  ];

  const getBuyRatio = () => {
    const { buy = 0, hold = 0, sell = 0 } = analysis;
    const total = buy + hold + sell;
    return total > 0 ? (buy / total) * 100 : 50;
  };

  const getRecommendationColor = (recommendation: string) => {
    if (!recommendation || recommendation === "N/A") return "text-muted-foreground";
    if (recommendation.toLowerCase().includes("buy")) return "text-profit";
    if (recommendation.toLowerCase().includes("sell")) return "text-loss";
    return "text-muted-foreground";
  };

  const getSignalColor = (signal: TechnicalSignal) => {
    if (!signal.sentiment) return "text-muted-foreground";
    if (signal.sentiment === "bullish") return "text-profit";
    if (signal.sentiment === "bearish") return "text-loss";
    return "text-muted-foreground";
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-base font-medium">Trading Signals</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Technical Analysis</span>
            <span className={`font-medium ${getRecommendationColor(analysis.recommendation || "")}`}>
              {analysis.recommendation || "N/A"}
            </span>
          </div>
          <Progress value={getBuyRatio()} className="h-2 bg-muted" 
            indicatorClassName="bg-profit" />

          <div className="grid grid-cols-3 text-center text-sm">
            <div>
              <div className="font-medium text-profit">{analysis.buy || 0}</div>
              <div className="text-muted-foreground">Buy</div>
            </div>
            <div>
              <div className="font-medium text-muted-foreground">{analysis.hold || 0}</div>
              <div className="text-muted-foreground">Hold</div>
            </div>
            <div>
              <div className="font-medium text-loss">{analysis.sell || 0}</div>
              <div className="text-muted-foreground">Sell</div>
            </div>
          </div>

          <div className="pt-3 border-t border-border">
            {signals.map((signal, index) => (
              <div key={index} className="flex items-center justify-between mb-1">
                <span className="text-sm">{signal.name}</span>
                <span className={`text-sm font-mono ${getSignalColor(signal)}`}>
                  {signal.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
