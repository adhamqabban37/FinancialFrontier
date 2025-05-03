import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { StockHeader } from "@/components/StockHeader";
import { StockChart } from "@/components/StockChart";
import { KeyMetrics } from "@/components/KeyMetrics";
import { CompanyInfo } from "@/components/CompanyInfo";
import { TradingSignals } from "@/components/TradingSignals";
import { NewsHeadlines } from "@/components/NewsHeadlines";
import { useMobile } from "@/hooks/use-mobile";
import { Stock, StockHistory, StockMetric, CompanyInfo as CompanyInfoType, TradingSignal, NewsItem } from "@/types/stock";

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentStock, setCurrentStock] = useState<string>("AAPL");
  const isMobile = useMobile();

  // Set sidebar state based on screen size on initial render
  useState(() => {
    setSidebarOpen(!isMobile);
  });

  // Stock data query
  const { data: stockData, isLoading: isStockLoading } = useQuery<Stock | null>({
    queryKey: [`/api/stocks/${currentStock}`],
    enabled: !!currentStock,
  });

  // Price history query
  const { data: priceHistory, isLoading: isPriceHistoryLoading } = useQuery<StockHistory[]>({
    queryKey: [`/api/stocks/history/${currentStock}`],
    enabled: !!currentStock,
  });

  // Financial metrics query
  const { data: metrics, isLoading: isMetricsLoading } = useQuery<StockMetric[] | null>({
    queryKey: [`/api/stocks/metrics/${currentStock}`],
    enabled: !!currentStock,
  });

  // Company info query
  const { data: companyInfo, isLoading: isCompanyInfoLoading } = useQuery<CompanyInfo | null>({
    queryKey: [`/api/stocks/company/${currentStock}`],
    enabled: !!currentStock,
  });

  // Trading signals query
  const { data: tradingSignals, isLoading: isTradingSignalsLoading } = useQuery<TradingSignal | null>({
    queryKey: [`/api/stocks/trading-signals/${currentStock}`],
    enabled: !!currentStock,
  });

  // News query
  const { data: newsItems, isLoading: isNewsLoading } = useQuery<NewsItem[] | null>({
    queryKey: [`/api/stocks/news/${currentStock}`],
    enabled: !!currentStock,
  });

  // Handle stock selection
  const handleSelectStock = (symbol: string) => {
    setCurrentStock(symbol);
  };

  return (
    <div className="min-h-screen bg-background font-inter">
      <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="pt-14 flex h-[calc(100vh-3.5rem)]">
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)}
          currentStock={currentStock}
          onSelectStock={handleSelectStock}
        />

        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <StockHeader 
            stock={stockData} 
            isLoading={isStockLoading} 
          />

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
              <StockChart 
                symbol={currentStock}
                isLoading={isPriceHistoryLoading}
                data={priceHistory}
              />
              
              <KeyMetrics 
                metrics={metrics} 
                isLoading={isMetricsLoading}
              />
            </div>

            <div>
              <CompanyInfo 
                symbol={currentStock} 
                companyInfo={companyInfo}
                isLoading={isCompanyInfoLoading}
              />
              
              <TradingSignals 
                data={tradingSignals}
                isLoading={isTradingSignalsLoading}
              />
              
              <NewsHeadlines 
                symbol={currentStock}
                news={newsItems}
                isLoading={isNewsLoading}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
