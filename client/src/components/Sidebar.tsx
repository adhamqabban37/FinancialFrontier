import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusIcon, SearchIcon } from "lucide-react";
import { useMobile } from "@/hooks/use-mobile";
import { Stock } from "@/types/stock";
import { useQuery } from "@tanstack/react-query";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  currentStock: string;
  onSelectStock: (symbol: string) => void;
};

export function Sidebar({ isOpen, onClose, currentStock, onSelectStock }: SidebarProps) {
  const isMobile = useMobile();
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

  const sidebarClasses = `fixed lg:static inset-0 z-10 w-64 bg-sidebar shadow-md lg:shadow-none transition-transform duration-200 ease-in-out ${
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
          className="fixed inset-0 bg-black bg-opacity-50 z-0"
          onClick={onClose}
        />
      )}

      <div className={sidebarClasses}>
        <div className="h-full flex flex-col">
          <div className="p-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search stocks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-2 px-4 pr-10 rounded-lg border border-input bg-card"
              />
              <SearchIcon className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />

              {/* Search results dropdown */}
              {searchQuery.length > 0 && (
                <div className="absolute mt-1 w-full bg-card shadow-lg rounded-lg border border-border z-20">
                  {searchResults.length > 0 ? (
                    searchResults.map((stock: Stock) => (
                      <div
                        key={stock.symbol}
                        onClick={() => handleSelectStock(stock.symbol)}
                        className="px-4 py-2 hover:bg-secondary cursor-pointer"
                      >
                        <div className="flex justify-between">
                          <span className="font-mono font-medium">{stock.symbol}</span>
                          <span className="text-xs text-muted-foreground truncate ml-2">
                            {stock.name}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-muted-foreground">
                      No results found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="p-4 font-medium text-muted-foreground text-sm">
            WATCHLIST
          </div>

          <div className="overflow-y-auto flex-grow">
            <ul className="px-2">
              {watchlist.map((stock: Stock) => (
                <li key={stock.symbol}>
                  <button
                    onClick={() => handleSelectStock(stock.symbol)}
                    className={`w-full px-3 py-2 rounded-lg flex items-center justify-between hover:bg-secondary ${
                      currentStock === stock.symbol ? "bg-secondary" : ""
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded bg-muted flex items-center justify-center mr-3">
                        <span className="text-primary font-medium">
                          {stock.symbol.substring(0, 1)}
                        </span>
                      </div>
                      <div className="text-left">
                        <div className="font-medium">{stock.symbol}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-[100px]">
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

          <div className="p-4 mt-auto border-t border-border">
            <Button 
              className="w-full" 
              onClick={handleAddToWatchlist}
            >
              <PlusIcon className="h-4 w-4 mr-2" /> Add Stock
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
