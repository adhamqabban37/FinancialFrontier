import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// User table remains unchanged
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Stocks table
export const stocks = pgTable("stocks", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull().unique(),
  name: text("name").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertStockSchema = createInsertSchema(stocks).pick({
  symbol: true,
  name: true,
  isActive: true,
});

export type InsertStock = z.infer<typeof insertStockSchema>;
export type Stock = typeof stocks.$inferSelect;

// Watchlists table
export const watchlists = pgTable("watchlists", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  isDefault: boolean("is_default").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const watchlistsRelations = relations(watchlists, ({ one, many }) => ({
  user: one(users, { fields: [watchlists.userId], references: [users.id] }),
  watchlistStocks: many(watchlistStocks),
}));

export const insertWatchlistSchema = createInsertSchema(watchlists).pick({
  userId: true,
  name: true,
  isDefault: true,
});

export type InsertWatchlist = z.infer<typeof insertWatchlistSchema>;
export type Watchlist = typeof watchlists.$inferSelect;

// WatchlistStocks (join table)
export const watchlistStocks = pgTable("watchlist_stocks", {
  id: serial("id").primaryKey(),
  watchlistId: integer("watchlist_id").references(() => watchlists.id).notNull(),
  stockId: integer("stock_id").references(() => stocks.id).notNull(),
  addedAt: timestamp("added_at").defaultNow().notNull(),
});

export const watchlistStocksRelations = relations(watchlistStocks, ({ one }) => ({
  watchlist: one(watchlists, { fields: [watchlistStocks.watchlistId], references: [watchlists.id] }),
  stock: one(stocks, { fields: [watchlistStocks.stockId], references: [stocks.id] }),
}));

export const insertWatchlistStockSchema = createInsertSchema(watchlistStocks).pick({
  watchlistId: true,
  stockId: true,
});

export type InsertWatchlistStock = z.infer<typeof insertWatchlistStockSchema>;
export type WatchlistStock = typeof watchlistStocks.$inferSelect;

// Stock cache table to store API responses
export const stockCache = pgTable("stock_cache", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull(),
  dataType: text("data_type").notNull(), // price, history, metrics, company, signals, news
  data: jsonb("data").notNull(),
  fetchedAt: timestamp("fetched_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});

export const insertStockCacheSchema = createInsertSchema(stockCache).pick({
  symbol: true,
  dataType: true,
  data: true,
  expiresAt: true,
});

export type InsertStockCache = z.infer<typeof insertStockCacheSchema>;
export type StockCache = typeof stockCache.$inferSelect;
