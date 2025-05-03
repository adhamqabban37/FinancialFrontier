export interface Stock {
  symbol: string;
  name: string;
  price?: number;
  change?: number;
  changePercent?: number;
  currency?: string;
  exchangeName?: string;
  marketState?: string;
}

export interface StockHistory {
  date: string; // ISO date string
  value: number; // price
}

export interface StockMetric {
  name: string;
  value: string | number;
  sectorAvg?: string | number;
  assessment?: string;
}

export interface CompanyInfo {
  description?: string;
  sector?: string;
  industry?: string;
  employees?: number | string;
  founded?: number | string;
  ceo?: string;
  headquarters?: string;
  website?: string;
}

export interface TradingSignal {
  technicalAnalysis?: {
    recommendation?: string;
    score?: number;
    buy?: number;
    hold?: number;
    sell?: number;
  };
  signals?: Array<{
    name: string;
    value: string | number;
    sentiment?: "bullish" | "bearish" | "neutral";
  }>;
}

export interface NewsItem {
  title: string;
  summary: string;
  url: string;
  publishedAt: string;
  source?: string;
}
