import { db } from "@db";
import { stocks, watchlists, watchlistStocks, users } from "@shared/schema";
import { eq, and } from "drizzle-orm";

class Storage {
  /**
   * Get default watchlist stocks
   */
  async getWatchlist() {
    try {
      // Get default stocks from the stocks table marked as active
      const watchlistItems = await db.query.stocks.findMany({
        where: eq(stocks.isActive, true),
      });
      
      return watchlistItems;
    } catch (error) {
      console.error("Error getting watchlist:", error);
      return [];
    }
  }

  /**
   * Add a stock to the watchlist
   */
  async addToWatchlist(symbol: string, name: string) {
    try {
      // First check if the stock already exists
      const existingStock = await db.query.stocks.findFirst({
        where: eq(stocks.symbol, symbol),
      });

      let stockId;
      
      if (existingStock) {
        // If it exists but is inactive, make it active
        if (!existingStock.isActive) {
          await db.update(stocks)
            .set({ isActive: true })
            .where(eq(stocks.id, existingStock.id));
        }
        stockId = existingStock.id;
      } else {
        // Insert new stock
        const [newStock] = await db.insert(stocks)
          .values({
            symbol,
            name,
            isActive: true,
          })
          .returning();
        
        stockId = newStock.id;
      }

      // Return the stock ID
      return stockId;
    } catch (error) {
      console.error(`Error adding ${symbol} to watchlist:`, error);
      throw error;
    }
  }

  /**
   * Remove a stock from the watchlist
   */
  async removeFromWatchlist(symbol: string) {
    try {
      // We don't actually delete the stock, just mark it as inactive
      await db.update(stocks)
        .set({ isActive: false })
        .where(eq(stocks.symbol, symbol));
      
      return true;
    } catch (error) {
      console.error(`Error removing ${symbol} from watchlist:`, error);
      throw error;
    }
  }

  /**
   * Create a user watchlist (for future use with authentication)
   */
  async createUserWatchlist(userId: number, name: string, isDefault = false) {
    try {
      const [watchlist] = await db.insert(watchlists)
        .values({
          userId,
          name,
          isDefault,
        })
        .returning();
      
      return watchlist;
    } catch (error) {
      console.error(`Error creating watchlist for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Add a stock to a user's watchlist (for future use with authentication)
   */
  async addStockToUserWatchlist(watchlistId: number, stockId: number) {
    try {
      // Check if the stock is already in the watchlist
      const existing = await db.query.watchlistStocks.findFirst({
        where: and(
          eq(watchlistStocks.watchlistId, watchlistId),
          eq(watchlistStocks.stockId, stockId)
        ),
      });
      
      if (existing) {
        return existing;
      }
      
      // Add to watchlist
      const [watchlistStock] = await db.insert(watchlistStocks)
        .values({
          watchlistId,
          stockId,
        })
        .returning();
      
      return watchlistStock;
    } catch (error) {
      console.error(`Error adding stock to watchlist ${watchlistId}:`, error);
      throw error;
    }
  }
}

export const storage = new Storage();
