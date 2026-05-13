import { eq, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, companies, documents, metrics, synthesis, refreshLog } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Company queries
export async function getCompanies(sector?: string) {
  const db = await getDb();
  if (!db) return [];
  
  if (sector) {
    return db.select().from(companies).where(eq(companies.sector, sector as any));
  }
  return db.select().from(companies);
}

export async function getCompanyById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(companies).where(eq(companies.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createCompany(data: any) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.insert(companies).values(data);
  return result;
}

// Document queries
export async function getDocuments(companyId?: number, status?: string) {
  const db = await getDb();
  if (!db) return [];
  
  if (companyId && status) {
    return db.select().from(documents).where(
      and(eq(documents.companyId, companyId), eq(documents.parseStatus, status as any))
    );
  }
  if (companyId) {
    return db.select().from(documents).where(eq(documents.companyId, companyId));
  }
  return db.select().from(documents);
}

export async function getDocumentByUrl(url: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(documents).where(eq(documents.sourceUrl, url)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createDocument(data: any) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.insert(documents).values(data);
  return result;
}

export async function updateDocument(id: number, data: any) {
  const db = await getDb();
  if (!db) return undefined;
  
  return db.update(documents).set(data).where(eq(documents.id, id));
}

// Metrics queries
export async function getMetrics(companyId: number, period?: string) {
  const db = await getDb();
  if (!db) return [];
  
  if (period) {
    return db.select().from(metrics).where(
      and(eq(metrics.companyId, companyId), eq(metrics.period, period))
    );
  }
  return db.select().from(metrics).where(eq(metrics.companyId, companyId));
}

export async function createMetric(data: any) {
  const db = await getDb();
  if (!db) return undefined;
  
  return db.insert(metrics).values(data);
}

export async function createMetrics(data: any[]) {
  const db = await getDb();
  if (!db) return undefined;
  
  return db.insert(metrics).values(data);
}

// Synthesis queries
export async function getSynthesis(sector: string, period?: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  if (period) {
    const result = await db.select().from(synthesis).where(
      and(eq(synthesis.sector, sector as any), eq(synthesis.period, period))
    ).limit(1);
    return result.length > 0 ? result[0] : undefined;
  }
  
  const result = await db.select().from(synthesis).where(eq(synthesis.sector, sector as any)).orderBy(desc(synthesis.period)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getSynthesisByPeriod(sector: string, limit: number = 4) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(synthesis).where(eq(synthesis.sector, sector as any)).orderBy(desc(synthesis.period)).limit(limit);
}

export async function createSynthesis(data: any) {
  const db = await getDb();
  if (!db) return undefined;
  
  return db.insert(synthesis).values(data);
}

export async function updateSynthesis(id: number, data: any) {
  const db = await getDb();
  if (!db) return undefined;
  
  return db.update(synthesis).set(data).where(eq(synthesis.id, id));
}

// Refresh log queries
export async function createRefreshLog(data: any) {
  const db = await getDb();
  if (!db) return undefined;
  
  try {
    const result = await db.insert(refreshLog).values(data);
    // For MySQL, the insert result contains the insert ID
    return (result as any).insertId || 1;
  } catch (error) {
    console.error('[Database] Failed to create refresh log:', error);
    return 1;
  }
}

export async function getLatestRefreshLog(sector?: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  if (sector) {
    const result = await db.select().from(refreshLog).where(eq(refreshLog.sector, sector as any)).orderBy(desc(refreshLog.runTimestamp)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  }
  
  const result = await db.select().from(refreshLog).orderBy(desc(refreshLog.runTimestamp)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateRefreshLog(id: number, data: any) {
  const db = await getDb();
  if (!db) return undefined;
  
  try {
    // Ensure errors is a string if provided
    const updateData = {
      ...data,
      errors: data.errors ? (typeof data.errors === 'string' ? data.errors : JSON.stringify(data.errors)) : null,
    };
    return db.update(refreshLog).set(updateData).where(eq(refreshLog.id, id));
  } catch (error) {
    console.error('[Database] Failed to update refresh log:', error);
    return undefined;
  }
}
