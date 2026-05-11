import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Companies table: stores company metadata across three sectors
export const companies = mysqlTable("companies", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  sector: mysqlEnum("sector", ["fintech", "defence", "biotech"]).notNull(),
  ticker: varchar("ticker", { length: 20 }).notNull(),
  exchange: varchar("exchange", { length: 50 }).notNull(), // NSE, BSE, NASDAQ, NYSE
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Company = typeof companies.$inferSelect;
export type InsertCompany = typeof companies.$inferInsert;

// Documents table: tracks all ingested source documents
export const documents = mysqlTable("documents", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  sourceUrl: text("sourceUrl").notNull(),
  documentType: mysqlEnum("documentType", [
    "earnings_call_transcript",
    "investor_presentation",
    "quarterly_financial_statement",
    "annual_report",
    "other"
  ]).notNull(),
  period: varchar("period", { length: 10 }).notNull(), // e.g., Q3FY24, 2024Q3
  dateFetched: timestamp("dateFetched").notNull(),
  parseStatus: mysqlEnum("parseStatus", ["pending", "success", "failed", "partial"]).default("pending").notNull(),
  parseError: text("parseError"),
  rawContent: text("rawContent"), // Truncated content for reference
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;

// Metrics table: stores individual metric values per company per quarter
export const metrics = mysqlTable("metrics", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  period: varchar("period", { length: 10 }).notNull(), // e.g., Q3FY24
  metricName: varchar("metricName", { length: 100 }).notNull(),
  metricValue: decimal("metricValue", { precision: 18, scale: 4 }),
  unit: varchar("unit", { length: 50 }), // e.g., "INR Cr", "%", "units"
  direction: mysqlEnum("direction", ["up", "down", "neutral"]),
  sourceDocumentId: int("sourceDocumentId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Metric = typeof metrics.$inferSelect;
export type InsertMetric = typeof metrics.$inferInsert;

// Synthesis table: stores pre-computed sector-level narratives and insights
export const synthesis = mysqlTable("synthesis", {
  id: int("id").autoincrement().primaryKey(),
  sector: mysqlEnum("sector", ["fintech", "defence", "biotech"]).notNull(),
  period: varchar("period", { length: 10 }).notNull(),
  synthesisText: text("synthesisText").notNull(), // Sector-level narrative
  investingLensText: text("investingLensText").notNull(), // Investing lens insights
  generatedAt: timestamp("generatedAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Synthesis = typeof synthesis.$inferSelect;
export type InsertSynthesis = typeof synthesis.$inferInsert;

// Refresh log table: tracks all refresh operations
export const refreshLog = mysqlTable("refresh_log", {
  id: int("id").autoincrement().primaryKey(),
  sector: mysqlEnum("sector", ["fintech", "defence", "biotech"]),
  runTimestamp: timestamp("runTimestamp").notNull(),
  documentsChecked: int("documentsChecked").default(0),
  newDocumentsFound: int("newDocumentsFound").default(0),
  errors: text("errors"), // JSON array of error messages
  status: mysqlEnum("status", ["pending", "in_progress", "completed", "failed"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type RefreshLog = typeof refreshLog.$inferSelect;
export type InsertRefreshLog = typeof refreshLog.$inferInsert;