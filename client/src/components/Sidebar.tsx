import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  PlusIcon, 
  SearchIcon, 
  TrendingUpIcon, 
  StarIcon, 
  BarChart3Icon, 
  PieChartIcon,
  Settings2Icon,
  HelpCircleIcon,
  DollarSignIcon
} from "lucide-react";
import { useMobile } from "@/hooks/use-mobile";
import { Stock } from "@/types/stock";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/components/ThemeProvider";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  currentStock: string;
  onSelectStock: (symbol: string) => void;
};

export function Sidebar({ isOpen, onClose, currentStock, onSelectStock }: SidebarProps) {
  const isMobile = useMobile();
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch watchlist from API
  const { data: watchlist = [] } = useQuery<Stock[]>({
    queryKey: ["/api/stocks/watchlist"],
    refetchOnWindowFocus: false,
  });

  // Fetch search results when query changes
  const { data: searchResults = [] } = useQuery<Stock[]>({
    queryKey: [`/api/stocks/search/${searchQuery}`],
    enabled: searchQuery.length > 1,
  });

  // Handle selecting a stock
  const handleSelectStock = (symbol: string) => {
    onSelectStock(symbol);
    setSearchQuery("");
    if (isMobile) {
      onClose();
    }
  };

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && isMobile) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscKey);
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [isOpen, onClose, isMobile]);

  const sidebarClasses = `fixed lg:static inset-0 z-10 w-72 bg-sidebar-background text-sidebar-foreground border-r border-sidebar-border shadow-lg lg:shadow-none transition-all duration-300 ease-in-out ${
    isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
  }`;

  // Handle adding a stock to watchlist - this would trigger a mutation in a real app
  const handleAddToWatchlist = () => {
    // This would be implemented with a mutation in a real application
    // For now, just close the search
    setSearchQuery("");
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-0"
          onClick={onClose}
        />
      )}

      <div className={sidebarClasses}>
        <div className="h-full flex flex-col">
          {/* Sidebar Header - only visible on large screens */}
          <div className="p-4 pb-2 hidden lg:flex items-center">
            <TrendingUpIcon className="h-5 w-5 text-sidebar-primary mr-2" />
            <h1 className="text-lg font-bold">
              StockInsight<span className="text-sidebar-primary">.</span>
            </h1>
          </div>
          
          {/* Search Bar */}
          <div className="p-4 pt-2">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search stocks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-2 pl-9 rounded-lg border border-sidebar-border bg-sidebar-background/80 focus-visible:ring-sidebar-ring"
              />

              {/* Search results dropdown */}
              {searchQuery.length > 0 && (
                <div className="absolute mt-1 w-full bg-card shadow-lg rounded-lg border border-border z-20">
                  {searchResults.length > 0 ? (
                    searchResults.map((stock: Stock) => (
                      <div
                        key={stock.symbol}
                        onClick={() => handleSelectStock(stock.symbol)}
                        className="px-4 py-2 hover:bg-secondary/50 cursor-pointer flex justify-between items-center"
                      >
                        <div className="flex items-center space-x-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                            <span className="text-xs font-semibold text-primary">
                              {stock.symbol.substring(0, 1)}
                            </span>
                          </div>
                          <span className="font-mono font-medium">{stock.symbol}</span>
                        </div>
                        <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                          {stock.name}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-muted-foreground text-center text-sm">
                      No results found for "{searchQuery}"
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Primary Navigation */}
          <div className="px-3 py-2">
            <div className="space-y-1">
              <Button variant="ghost" className="w-full justify-start font-normal hover:bg-sidebar-secondary">
                <BarChart3Icon className="h-4 w-4 mr-3" />
                Dashboard
              </Button>
              <Button variant="ghost" className="w-full justify-start font-normal hover:bg-sidebar-secondary">
                <DollarSignIcon className="h-4 w-4 mr-3" />
                Portfolio
              </Button>
              <Button variant="ghost" className="w-full justify-start font-normal hover:bg-sidebar-secondary">
                <PieChartIcon className="h-4 w-4 mr-3" />
                Analytics
              </Button>
            </div>
          </div>

          <Separator className="my-2 bg-sidebar-border" />

          {/* Watchlist Header */}
          <div className="px-4 py-2 flex items-center justify-between">
            <div className="flex items-center">
              <StarIcon className="h-4 w-4 text-sidebar-accent mr-2" />
              <span className="font-medium text-sm">WATCHLIST</span>
            </div>
            <Badge variant="outline" className="h-5 text-xs bg-sidebar-accent/10 text-sidebar-accent border-sidebar-accent/20">
              {watchlist.length}
            </Badge>
          </div>

          {/* Watchlist */}
          <div className="overflow-y-auto flex-grow pb-20 lg:pb-0">
            <ul className="px-2 space-y-1">
              {watchlist.map((stock: Stock) => (
                <li key={stock.symbol}>
                  <button
                    onClick={() => handleSelectStock(stock.symbol)}
                    className={`w-full px-3 py-2 rounded-lg flex items-center justify-between hover:bg-sidebar-secondary transition-colors duration-200 ${
                      currentStock === stock.symbol 
                        ? "bg-sidebar-secondary border-l-2 border-sidebar-primary" 
                        : ""
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full ${
                        stock.change && stock.change > 0 
                          ? "bg-profit/10 text-profit" 
                          : "bg-loss/10 text-loss"
                      } flex items-center justify-center mr-3`}>
                        <span className="font-medium text-xs">
                          {stock.symbol.substring(0, 2)}
                        </span>
                      </div>
                      <div className="text-left">
                        <div className="font-medium">{stock.symbol}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-[120px]">
                          {stock.name}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-medium">${stock.price?.toFixed(2) || "0.00"}</div>
                      <div className={`text-xs ${stock.change && stock.change > 0 ? "text-profit" : "text-loss"}`}>
                        {stock.changePercent ? (stock.changePercent > 0 ? "+" : "") + stock.changePercent.toFixed(2) + "%" : "0.00%"}
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 mt-auto border-t border-sidebar-border">
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-sidebar-secondary">
                <Settings2Icon className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-sidebar-secondary">
                <HelpCircleIcon className="h-4 w-4" />
              </Button>
              <Button 
                variant="default"
                size="sm"
                className="px-3 bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground" 
                onClick={handleAddToWatchlist}
              >
                <PlusIcon className="h-4 w-4 mr-1" /> Add Stock
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
