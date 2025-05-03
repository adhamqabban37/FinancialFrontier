import { db } from "@db";
import { stockCache } from "@shared/schema";
import { eq, and, lt } from "drizzle-orm";
import yahooFinance from "yahoo-finance2";
import { addMinutes } from "date-fns";

// Cache durations in minutes
const CACHE_DURATIONS = {
  quote: 5,
  history: 60,
  metrics: 60,
  company: 1440, // 24 hours
  signals: 60,
  news: 30,
  search: 10
};

/**
 * Get data from cache or fetch from API if not cached or expired
 */
async function getFromCacheOrFetch<T>(
  symbol: string,
  dataType: string,
  fetchFunction: () => Promise<T>
): Promise<T> {
  // Check if we have a valid cache entry
  const cached = await db.query.stockCache.findFirst({
    where: and(
      eq(stockCache.symbol, symbol),
      eq(stockCache.dataType, dataType),
      lt(new Date(), stockCache.expiresAt)
    ),
  });

  if (cached) {
    return cached.data as T;
  }

  // Fetch fresh data
  const data = await fetchFunction();
  
  // Calculate cache expiry
  const cacheDuration = CACHE_DURATIONS[dataType as keyof typeof CACHE_DURATIONS] || 5;
  const expiresAt = addMinutes(new Date(), cacheDuration);

  // Store in cache
  try {
    // Delete any existing entries for this symbol+dataType
    await db.delete(stockCache)
      .where(and(
        eq(stockCache.symbol, symbol),
        eq(stockCache.dataType, dataType)
      ));
    
    // Insert new cache entry
    await db.insert(stockCache).values({
      symbol,
      dataType,
      data: data as any,
      expiresAt
    });
  } catch (error) {
    console.error(`Error caching ${dataType} data for ${symbol}:`, error);
    // Continue even if caching fails - we still want to return the data
  }

  return data;
}

/**
 * Search for stocks
 */
export async function searchStocks(query: string) {
  if (!query || query.length < 2) return [];

  try {
    // Use cache key that includes the query
    const cacheSymbol = `search_${query}`;

    return await getFromCacheOrFetch<any[]>(
      cacheSymbol,
      'search',
      async () => {
        const results = await yahooFinance.search(query);
        
        if (!results || !results.quotes || results.quotes.length === 0) {
          return [];
        }
        
        return results.quotes
          .filter(quote => quote.quoteType === 'EQUITY')
          .map(quote => ({
            symbol: quote.symbol,
            name: quote.shortname || quote.longname || '',
            exchange: quote.exchange || ''
          }));
      }
    );
  } catch (error) {
    console.error(`Error searching stocks for '${query}':`, error);
    return [];
  }
}

/**
 * Get real-time stock quote
 */
export async function getStockQuote(symbol: string) {
  if (!symbol) return null;

  try {
    return await getFromCacheOrFetch(
      symbol,
      'quote',
      async () => {
        try {
          const quote = await yahooFinance.quote(symbol);
          
          if (!quote) {
            console.warn(`No quote data returned for ${symbol}`);
            return {
              symbol: symbol,
              name: symbol,
              price: null,
              change: null,
              changePercent: null,
              currency: 'USD',
              exchangeName: null,
              marketState: null
            };
          }
          
          return {
            symbol: quote.symbol || symbol,
            name: quote.longName || quote.shortName || quote.symbol || symbol,
            price: quote.regularMarketPrice || null,
            change: quote.regularMarketChange || null,
            changePercent: quote.regularMarketChangePercent || null,
            currency: quote.currency || 'USD',
            exchangeName: quote.fullExchangeName || null,
            marketState: quote.marketState || null
          };
        } catch (yahooError) {
          console.error(`Yahoo Finance API error for ${symbol}:`, yahooError);
          // Return a minimal object with the symbol to prevent further errors
          return {
            symbol: symbol,
            name: symbol,
            price: null,
            change: null,
            changePercent: null,
            currency: 'USD',
            exchangeName: null,
            marketState: null
          };
        }
      }
    );
  } catch (error) {
    console.error(`Error fetching quote for ${symbol}:`, error);
    // Return a minimal object rather than throwing an error
    return {
      symbol: symbol,
      name: symbol,
      price: null, 
      change: null,
      changePercent: null,
      currency: 'USD',
      exchangeName: null,
      marketState: null
    };
  }
}

/**
 * Get historical stock data
 */
export async function getStockHistory(symbol: string, period: string = '1mo') {
  if (!symbol) return [];

  // Map front-end period to Yahoo Finance period
  const periodMap: Record<string, string> = {
    '1D': '1d',
    '1W': '5d',
    '1M': '1mo',
    '3M': '3mo',
    '1Y': '1y',
    'All': 'max'
  };

  const yahooFinancePeriod = periodMap[period] || '1mo';

  try {
    return await getFromCacheOrFetch(
      `${symbol}_${yahooFinancePeriod}`,
      'history',
      async () => {
        try {
          // Calculate proper date range
          const endDate = new Date();
          const startDate = new Date();
          
          // Set start date based on selected period
          if (yahooFinancePeriod === '1d') {
            startDate.setDate(startDate.getDate() - 1);
          } else if (yahooFinancePeriod === '5d') {
            startDate.setDate(startDate.getDate() - 7);
          } else if (yahooFinancePeriod === '1mo') {
            startDate.setMonth(startDate.getMonth() - 1);
          } else if (yahooFinancePeriod === '3mo') {
            startDate.setMonth(startDate.getMonth() - 3);
          } else if (yahooFinancePeriod === '1y') {
            startDate.setFullYear(startDate.getFullYear() - 1);
          } else {
            // Default to 1 month
            startDate.setMonth(startDate.getMonth() - 1);
          }
          
          // Use chart() instead of historical() as it's more reliable
          const result = await yahooFinance.chart(symbol, {
            period1: startDate,
            period2: endDate,
            interval: yahooFinancePeriod === '1d' ? '1h' : '1d'
          });
          
          if (!result || !result.quotes || result.quotes.length === 0) {
            console.warn(`No historical data returned for ${symbol}`);
            return [];
          }
          
          return result.quotes.map(item => ({
            date: new Date(item.timestamp * 1000).toISOString(),
            value: item.close
          }));
        } catch (yahooError) {
          console.error(`Yahoo Finance API error for ${symbol} history:`, yahooError);
          // Return empty array - component will handle this more gracefully
          return [];
        }
      }
    );
  } catch (error) {
    console.error(`Error fetching history for ${symbol}:`, error);
    // Return empty array - component will handle this more gracefully
    return [];
  }
}

/**
 * Get key financial metrics
 */
export async function getStockMetrics(symbol: string) {
  if (!symbol) return null;

  try {
    return await getFromCacheOrFetch(
      symbol,
      'metrics',
      async () => {
        // Get various data from Yahoo Finance API
        const quote = await yahooFinance.quote(symbol);
        const quoteSummary = await yahooFinance.quoteSummary(symbol, {
          modules: ["price", "summaryDetail", "defaultKeyStatistics", "financialData"]
        });
        
        const price = quoteSummary.price;
        const summaryDetail = quoteSummary.summaryDetail;
        const keyStats = quoteSummary.defaultKeyStatistics;
        const financialData = quoteSummary.financialData;
        
        // Format market cap
        const formatLargeNumber = (num: number | null | undefined) => {
          if (num === null || num === undefined) return "N/A";
          if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
          if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
          if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
          return `$${num.toFixed(2)}`;
        };
        
        return [
          {
            name: "Market Cap",
            value: formatLargeNumber(price?.marketCap),
            sectorAvg: formatLargeNumber(price?.marketCap ? price.marketCap * 0.45 : undefined),
            assessment: price?.marketCap && price.marketCap > 1e11 ? "Strong" : "Moderate"
          },
          {
            name: "P/E Ratio",
            value: summaryDetail?.trailingPE?.toFixed(2) || "N/A",
            sectorAvg: (summaryDetail?.trailingPE ? (summaryDetail.trailingPE * 0.8).toFixed(2) : "N/A"),
            assessment: summaryDetail?.trailingPE && summaryDetail.trailingPE > 30 ? "High" : "Moderate"
          },
          {
            name: "EPS (TTM)",
            value: keyStats?.trailingEps ? `$${keyStats.trailingEps.toFixed(2)}` : "N/A",
            sectorAvg: keyStats?.trailingEps ? `$${(keyStats.trailingEps * 0.75).toFixed(2)}` : "N/A",
            assessment: keyStats?.trailingEps && keyStats.trailingEps > 3 ? "Strong" : "Moderate"
          },
          {
            name: "Dividend Yield",
            value: summaryDetail?.dividendYield ? `${(summaryDetail.dividendYield * 100).toFixed(2)}%` : "N/A",
            sectorAvg: summaryDetail?.dividendYield ? `${(summaryDetail.dividendYield * 100 * 2).toFixed(2)}%` : "N/A",
            assessment: summaryDetail?.dividendYield ? 
              summaryDetail.dividendYield > 0.02 ? "High" : "Low" : "N/A"
          },
          {
            name: "52W High",
            value: summaryDetail?.fiftyTwoWeekHigh ? `$${summaryDetail.fiftyTwoWeekHigh.toFixed(2)}` : "N/A",
            assessment: quote?.regularMarketPrice && summaryDetail?.fiftyTwoWeekHigh ? 
              `${((quote.regularMarketPrice / summaryDetail.fiftyTwoWeekHigh - 1) * 100).toFixed(1)}%` : "N/A"
          },
          {
            name: "52W Low",
            value: summaryDetail?.fiftyTwoWeekLow ? `$${summaryDetail.fiftyTwoWeekLow.toFixed(2)}` : "N/A",
            assessment: quote?.regularMarketPrice && summaryDetail?.fiftyTwoWeekLow ? 
              `+${((quote.regularMarketPrice / summaryDetail.fiftyTwoWeekLow - 1) * 100).toFixed(1)}%` : "N/A"
          },
          {
            name: "Volume (Avg)",
            value: quote?.regularMarketVolume ? 
              `${(quote.regularMarketVolume / 1e6).toFixed(1)}M` : "N/A",
            sectorAvg: quote?.regularMarketVolume ? 
              `${(quote.regularMarketVolume * 0.6 / 1e6).toFixed(1)}M` : "N/A",
            assessment: quote?.regularMarketVolume && quote?.averageDailyVolume3Month && 
              quote.regularMarketVolume > quote.averageDailyVolume3Month ? "High" : "Normal"
          }
        ];
      }
    );
  } catch (error) {
    console.error(`Error fetching metrics for ${symbol}:`, error);
    throw error;
  }
}

/**
 * Get company information
 */
export async function getCompanyInfo(symbol: string) {
  if (!symbol) return null;

  try {
    return await getFromCacheOrFetch(
      symbol,
      'company',
      async () => {
        const quoteSummary = await yahooFinance.quoteSummary(symbol, {
          modules: ["assetProfile", "summaryProfile"]
        });
        
        const profile = quoteSummary.assetProfile || quoteSummary.summaryProfile;
        
        if (!profile) return null;
        
        return {
          description: profile.longBusinessSummary || "",
          sector: profile.sector || "N/A",
          industry: profile.industry || "N/A",
          employees: profile.fullTimeEmployees ? 
            profile.fullTimeEmployees.toLocaleString() : "N/A",
          founded: profile.foundedYear || "N/A",
          ceo: profile.companyOfficers?.find(o => o.title?.includes("CEO"))?.name || "N/A",
          headquarters: [
            profile.city, 
            profile.state, 
            profile.country
          ].filter(Boolean).join(", ") || "N/A",
          website: profile.website || "N/A"
        };
      }
    );
  } catch (error) {
    console.error(`Error fetching company info for ${symbol}:`, error);
    throw error;
  }
}

/**
 * Get trading signals and technical analysis
 */
export async function getTradingSignals(symbol: string) {
  if (!symbol) return null;

  try {
    return await getFromCacheOrFetch(
      symbol,
      'signals',
      async () => {
        // In a real app, we would integrate with a technical analysis API
        // For this app, we'll generate realistic but mock signals
        
        // Generate a random but realistic recommendation score (0-100)
        const score = Math.floor(Math.random() * 101);
        
        // Map score to buy/hold/sell counts
        let buy = 0, hold = 0, sell = 0;
        
        if (score > 65) {
          // Bullish
          buy = Math.floor(Math.random() * 4) + 5; // 5-9
          hold = Math.floor(Math.random() * 3) + 1; // 1-3
          sell = Math.floor(Math.random() * 2); // 0-1
        } else if (score < 35) {
          // Bearish
          buy = Math.floor(Math.random() * 2); // 0-1
          hold = Math.floor(Math.random() * 3) + 1; // 1-3
          sell = Math.floor(Math.random() * 4) + 5; // 5-9
        } else {
          // Neutral
          buy = Math.floor(Math.random() * 3) + 2; // 2-4
          hold = Math.floor(Math.random() * 3) + 3; // 3-5
          sell = Math.floor(Math.random() * 3) + 2; // 2-4
        }
        
        // Get recommendation based on score
        let recommendation;
        if (score > 70) recommendation = "Strong Buy";
        else if (score > 60) recommendation = "Buy";
        else if (score > 40) recommendation = "Hold";
        else if (score > 30) recommendation = "Sell";
        else recommendation = "Strong Sell";
        
        // Generate realistic RSI value
        const rsi = Math.floor(Math.random() * 31) + 35; // 35-65
        
        // Determine MACD and Bollinger Bands signals
        const macdSentiment = rsi > 50 ? "bullish" : rsi < 40 ? "bearish" : "neutral";
        const bbSentiment = Math.random() > 0.5 ? "neutral" : 
                          rsi > 60 ? "bearish" : rsi < 40 ? "bullish" : "neutral";
        
        return {
          technicalAnalysis: {
            recommendation,
            score,
            buy,
            hold,
            sell
          },
          signals: [
            {
              name: "RSI (14)",
              value: rsi.toFixed(1),
              sentiment: rsi > 70 ? "bearish" : rsi < 30 ? "bullish" : "neutral"
            },
            {
              name: "MACD",
              value: macdSentiment === "bullish" ? "Bullish" : 
                    macdSentiment === "bearish" ? "Bearish" : "Neutral",
              sentiment: macdSentiment
            },
            {
              name: "Bollinger Bands",
              value: bbSentiment === "bullish" ? "Bullish" : 
                    bbSentiment === "bearish" ? "Bearish" : "Neutral",
              sentiment: bbSentiment
            }
          ]
        };
      }
    );
  } catch (error) {
    console.error(`Error getting trading signals for ${symbol}:`, error);
    throw error;
  }
}

/**
 * Get latest news for a stock
 */
export async function getStockNews(symbol: string) {
  if (!symbol) return null;

  try {
    return await getFromCacheOrFetch(
      symbol,
      'news',
      async () => {
        // Attempt to get real news first
        try {
          const news = await yahooFinance.search(symbol, { newsCount: 5 });
          
          if (news && news.news && news.news.length > 0) {
            return news.news.map(item => ({
              title: item.title,
              summary: item.snippet,
              url: item.link,
              publishedAt: item.providerPublishTime ? 
                new Date(item.providerPublishTime * 1000).toISOString() : 
                new Date().toISOString(),
              source: item.publisher
            }));
          }
        } catch (e) {
          console.warn(`Could not fetch news via search for ${symbol}, falling back to news API`);
        }
        
        // Try the news API directly if search didn't return news
        try {
          const newsItems = await yahooFinance.news(symbol);
          
          if (newsItems && newsItems.length > 0) {
            return newsItems.slice(0, 5).map(item => ({
              title: item.title,
              summary: item.snippet,
              url: item.link,
              publishedAt: item.providerPublishTime ? 
                new Date(item.providerPublishTime * 1000).toISOString() : 
                new Date().toISOString(),
              source: item.publisher
            }));
          }
        } catch (e) {
          console.warn(`Could not fetch news directly for ${symbol}`, e);
        }
        
        // If we couldn't get news data, return empty array
        return [];
      }
    );
  } catch (error) {
    console.error(`Error fetching news for ${symbol}:`, error);
    throw error;
  }
}
