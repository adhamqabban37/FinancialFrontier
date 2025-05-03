import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  getStockQuote, 
  getStockHistory, 
  getStockMetrics, 
  getCompanyInfo, 
  getTradingSignals, 
  getStockNews,
  searchStocks
} from "./services/yahoo";

export async function registerRoutes(app: Express): Promise<Server> {
  // API prefix for all routes
  const apiPrefix = "/api";

  // Search for stocks
  app.get(`${apiPrefix}/stocks/search`, async (req, res) => {
    try {
      const query = req.query.q as string || "";
      if (!query || query.length < 2) {
        return res.json([]);
      }
      
      const results = await searchStocks(query);
      return res.json(results);
    } catch (error) {
      console.error("Error searching stocks:", error);
      return res.status(500).json({ error: "Failed to search stocks" });
    }
  });

  // Get watchlist
  app.get(`${apiPrefix}/stocks/watchlist`, async (req, res) => {
    try {
      const watchlist = await storage.getWatchlist();
      
      // Get latest quotes for all watchlist stocks
      const watchlistWithQuotes = await Promise.all(
        watchlist.map(async (stock) => {
          try {
            const quote = await getStockQuote(stock.symbol);
            return { ...stock, ...quote };
          } catch (error) {
            console.error(`Error fetching quote for ${stock.symbol}:`, error);
            return stock;
          }
        })
      );
      
      return res.json(watchlistWithQuotes);
    } catch (error) {
      console.error("Error fetching watchlist:", error);
      return res.status(500).json({ error: "Failed to fetch watchlist" });
    }
  });

  // Get stock quote
  app.get(`${apiPrefix}/stocks/:symbol`, async (req, res) => {
    try {
      const { symbol } = req.params;
      if (!symbol) {
        return res.status(400).json({ error: "Stock symbol is required" });
      }
      
      const quote = await getStockQuote(symbol);
      return res.json(quote);
    } catch (error) {
      console.error(`Error fetching stock quote for ${req.params.symbol}:`, error);
      return res.status(500).json({ error: "Failed to fetch stock quote" });
    }
  });

  // Get stock price history
  app.get(`${apiPrefix}/stocks/history/:symbol`, async (req, res) => {
    try {
      const { symbol } = req.params;
      const period = req.query.period as string || "1mo";
      
      if (!symbol) {
        return res.status(400).json({ error: "Stock symbol is required" });
      }
      
      const history = await getStockHistory(symbol, period);
      return res.json(history);
    } catch (error) {
      console.error(`Error fetching stock history for ${req.params.symbol}:`, error);
      return res.status(500).json({ error: "Failed to fetch stock history" });
    }
  });

  // Get stock metrics
  app.get(`${apiPrefix}/stocks/metrics/:symbol`, async (req, res) => {
    try {
      const { symbol } = req.params;
      if (!symbol) {
        return res.status(400).json({ error: "Stock symbol is required" });
      }
      
      const metrics = await getStockMetrics(symbol);
      return res.json(metrics);
    } catch (error) {
      console.error(`Error fetching stock metrics for ${req.params.symbol}:`, error);
      return res.status(500).json({ error: "Failed to fetch stock metrics" });
    }
  });

  // Get company info
  app.get(`${apiPrefix}/stocks/company/:symbol`, async (req, res) => {
    try {
      const { symbol } = req.params;
      if (!symbol) {
        return res.status(400).json({ error: "Stock symbol is required" });
      }
      
      const companyInfo = await getCompanyInfo(symbol);
      return res.json(companyInfo);
    } catch (error) {
      console.error(`Error fetching company info for ${req.params.symbol}:`, error);
      return res.status(500).json({ error: "Failed to fetch company info" });
    }
  });

  // Get trading signals
  app.get(`${apiPrefix}/stocks/trading-signals/:symbol`, async (req, res) => {
    try {
      const { symbol } = req.params;
      if (!symbol) {
        return res.status(400).json({ error: "Stock symbol is required" });
      }
      
      const signals = await getTradingSignals(symbol);
      return res.json(signals);
    } catch (error) {
      console.error(`Error fetching trading signals for ${req.params.symbol}:`, error);
      return res.status(500).json({ error: "Failed to fetch trading signals" });
    }
  });

  // Get stock news
  app.get(`${apiPrefix}/stocks/news/:symbol`, async (req, res) => {
    try {
      const { symbol } = req.params;
      if (!symbol) {
        return res.status(400).json({ error: "Stock symbol is required" });
      }
      
      const news = await getStockNews(symbol);
      return res.json(news);
    } catch (error) {
      console.error(`Error fetching news for ${req.params.symbol}:`, error);
      return res.status(500).json({ error: "Failed to fetch stock news" });
    }
  });

  // Add stock to watchlist
  app.post(`${apiPrefix}/stocks/watchlist`, async (req, res) => {
    try {
      const { symbol } = req.body;
      if (!symbol) {
        return res.status(400).json({ error: "Stock symbol is required" });
      }
      
      // First make sure the stock exists
      const stockInfo = await getStockQuote(symbol);
      if (!stockInfo) {
        return res.status(404).json({ error: "Stock not found" });
      }
      
      // Add to watchlist
      await storage.addToWatchlist(symbol, stockInfo.name);
      return res.json({ success: true, message: `${symbol} added to watchlist` });
    } catch (error) {
      console.error(`Error adding stock to watchlist:`, error);
      return res.status(500).json({ error: "Failed to add stock to watchlist" });
    }
  });

  // Remove stock from watchlist
  app.delete(`${apiPrefix}/stocks/watchlist/:symbol`, async (req, res) => {
    try {
      const { symbol } = req.params;
      if (!symbol) {
        return res.status(400).json({ error: "Stock symbol is required" });
      }
      
      await storage.removeFromWatchlist(symbol);
      return res.json({ success: true, message: `${symbol} removed from watchlist` });
    } catch (error) {
      console.error(`Error removing stock from watchlist:`, error);
      return res.status(500).json({ error: "Failed to remove stock from watchlist" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
