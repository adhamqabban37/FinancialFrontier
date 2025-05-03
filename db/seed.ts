import { db } from "./index";
import { stocks } from "@shared/schema";
import { eq } from "drizzle-orm";

async function seed() {
  try {
    console.log("🌱 Seeding database...");
    
    // Default watchlist stocks
    const defaultStocks = [
      { symbol: "AAPL", name: "Apple Inc." },
      { symbol: "MSFT", name: "Microsoft Corporation" },
      { symbol: "GOOGL", name: "Alphabet Inc." },
      { symbol: "AMZN", name: "Amazon.com, Inc." },
      { symbol: "TSLA", name: "Tesla, Inc." },
      { symbol: "META", name: "Meta Platforms, Inc." },
      { symbol: "NVDA", name: "NVIDIA Corporation" },
      { symbol: "BRK-B", name: "Berkshire Hathaway Inc." },
      { symbol: "JPM", name: "JPMorgan Chase & Co." },
      { symbol: "V", name: "Visa Inc." }
    ];
    
    // For each stock, insert if it doesn't exist
    for (const stock of defaultStocks) {
      const existing = await db.query.stocks.findFirst({
        where: eq(stocks.symbol, stock.symbol),
      });
      
      if (!existing) {
        console.log(`Adding ${stock.symbol} to watchlist`);
        await db.insert(stocks).values({
          symbol: stock.symbol,
          name: stock.name,
          isActive: true,
        });
      } else {
        // Make sure it's active
        if (!existing.isActive) {
          console.log(`Activating ${stock.symbol} in watchlist`);
          await db.update(stocks)
            .set({ isActive: true })
            .where(eq(stocks.id, existing.id));
        }
      }
    }
    
    console.log("✅ Seed completed successfully");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  }
}

seed();
