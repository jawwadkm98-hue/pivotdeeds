import fs from "node:fs";
import path from "node:path";
import { COLUMN_PATCHES, SCHEMA_SQL } from "./schema";

export type Sql = {
  all<T>(sql: string, params?: unknown[]): Promise<T[]>;
  get<T>(sql: string, params?: unknown[]): Promise<T | undefined>;
  run(sql: string, params?: unknown[]): Promise<{ lastInsertRowid: number }>;
  exec(sql: string): Promise<void>;
};

type D1Prepared = {
  bind(...values: unknown[]): D1Prepared;
  all<T>(): Promise<{ results?: T[] }>;
  first<T>(): Promise<T | null>;
  run(): Promise<{ meta?: { last_row_id?: number } }>;
};

type D1Database = {
  prepare(query: string): D1Prepared;
  exec(query: string): Promise<unknown>;
};

export type PhotoBucket = {
  put(key: string, value: ArrayBuffer | ArrayBufferView, options?: { httpMetadata?: { contentType?: string } }): Promise<unknown>;
  get(key: string): Promise<{ body: ReadableStream; httpMetadata?: { contentType?: string } } | null>;
  delete(key: string): Promise<unknown>;
};

export type SendEmailBinding = {
  send(message: unknown): Promise<void>;
};

type WorkerEnv = {
  DB?: D1Database;
  PHOTOS?: PhotoBucket;
  NOTIFY_EMAIL?: SendEmailBinding;
  ADMIN_PASSWORD?: string;
  SESSION_SECRET?: string;
  ADMIN_SESSION_SECRET?: string;
};

let cached: Sql | null = null;
let schemaReady = false;

export function isCloudflareWorker(): boolean {
  return typeof navigator !== "undefined" && navigator.userAgent === "Cloudflare-Workers";
}

export async function cloudflareEnv(): Promise<WorkerEnv> {
  if (!isCloudflareWorker()) return {};
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const { env } = await getCloudflareContext({ async: true });
    return env as WorkerEnv;
  } catch {
    return {};
  }
}

function d1Adapter(db: D1Database): Sql {
  const statement = (sql: string, params: unknown[] = []) => {
    const prepared = db.prepare(sql);
    return params.length > 0 ? prepared.bind(...params) : prepared;
  };
  return {
    async all<T>(sql: string, params?: unknown[]): Promise<T[]> {
      const result = await statement(sql, params).all<T>();
      return result.results ?? [];
    },
    async get<T>(sql: string, params?: unknown[]): Promise<T | undefined> {
      const row = await statement(sql, params).first<T>();
      return row ?? undefined;
    },
    async run(sql, params) {
      const result = await statement(sql, params).run();
      return { lastInsertRowid: Number(result.meta?.last_row_id ?? 0) };
    },
    async exec(sql) {
      const statements = sql
        .split(";")
        .map((s) => s.replace(/\s+/g, " ").trim())
        .filter(Boolean);
      if (statements.length === 0) return;
      await db.exec(statements.map((s) => s + ";").join("\n"));
    },
  };
}

type BetterSqlite = {
  prepare(sql: string): {
    all(...params: unknown[]): unknown[];
    get(...params: unknown[]): unknown;
    run(...params: unknown[]): { lastInsertRowid: number | bigint };
  };
  exec(sql: string): void;
  close(): void;
};

let sqlite: BetterSqlite | null = null;

function openSqlite(): Sql {
  if (!sqlite) {
    const req = eval("require") as NodeRequire;
    const Database = req("better-sqlite3") as new (file: string) => BetterSqlite & { pragma(s: string): unknown };
    const file = process.env.DATABASE_PATH || path.join(process.cwd(), "data", "crownwholesalers.sqlite");
    fs.mkdirSync(path.dirname(file), { recursive: true });
    const instance = new Database(file);
    instance.pragma("foreign_keys = ON");
    try {
      instance.pragma("busy_timeout = 5000");
    } catch {
      // older builds
    }
    sqlite = instance;
  }
  const db = sqlite;
  return {
    async all(sql, params = []) {
      return db.prepare(sql).all(...params) as never[];
    },
    async get(sql, params = []) {
      return db.prepare(sql).get(...params) as never;
    },
    async run(sql, params = []) {
      const result = db.prepare(sql).run(...params);
      return { lastInsertRowid: Number(result.lastInsertRowid) };
    },
    async exec(sql) {
      db.exec(sql);
    },
  };
}

export async function getSql(): Promise<Sql> {
  if (!cached) {
    if (isCloudflareWorker()) {
      const env = await cloudflareEnv();
      if (!env.DB) throw new Error("D1 binding DB is not configured");
      cached = d1Adapter(env.DB);
    } else {
      cached = openSqlite();
    }
  }
  if (!schemaReady) {
    await cached.exec(SCHEMA_SQL);
    for (const statement of COLUMN_PATCHES) {
      try {
        await cached.run(statement);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (!/duplicate column/i.test(message)) throw error;
      }
    }
    schemaReady = true;
  }
  return cached;
}

function uploadRoot(): string {
  const root = process.env.DATABASE_PATH ? path.dirname(process.env.DATABASE_PATH) : path.join(process.cwd(), "data");
  return path.join(root, "uploads");
}

function localBlobPath(key: string): string | null {
  if (!key || key.includes("..") || path.isAbsolute(key)) return null;
  const root = path.resolve(uploadRoot());
  const full = path.resolve(root, key);
  if (full !== root && !full.startsWith(root + path.sep)) return null;
  return full;
}

export async function writeBlob(key: string, bytes: Uint8Array, contentType: string): Promise<"r2" | "disk" | "skipped"> {
  const safe = localBlobPath(key);
  if (!safe) throw new Error("Invalid storage key");
  const bucket = await getPhotoBucket();
  if (bucket) {
    await bucket.put(key, bytes, { httpMetadata: { contentType } });
    return "r2";
  }
  if (isCloudflareWorker()) return "skipped";
  fs.mkdirSync(path.dirname(safe), { recursive: true });
  fs.writeFileSync(safe, bytes);
  return "disk";
}

export async function readBlob(key: string): Promise<{ body: Uint8Array | ReadableStream; contentType: string } | null> {
  const bucket = await getPhotoBucket();
  if (bucket) {
    const object = await bucket.get(key);
    if (!object) return null;
    return { body: object.body, contentType: object.httpMetadata?.contentType || "application/octet-stream" };
  }
  if (isCloudflareWorker()) return null;
  const safe = localBlobPath(key);
  if (!safe || !fs.existsSync(safe)) return null;
  return { body: fs.readFileSync(safe), contentType: "application/octet-stream" };
}

export async function deleteBlob(key: string): Promise<void> {
  const bucket = await getPhotoBucket();
  if (bucket) {
    await bucket.delete(key);
    return;
  }
  if (isCloudflareWorker()) return;
  const safe = localBlobPath(key);
  if (safe && fs.existsSync(safe)) fs.rmSync(safe);
}

export async function getPhotoBucket(): Promise<PhotoBucket | null> {
  if (!isCloudflareWorker()) return null;
  const env = await cloudflareEnv();
  return env.PHOTOS ?? null;
}

export function closeDb(): void {
  sqlite?.close();
  sqlite = null;
  cached = null;
  schemaReady = false;
}

export async function readRuntimeEnv(name: string): Promise<string> {
  const fromProcess = process.env[name];
  if (fromProcess) return fromProcess;
  const env = await cloudflareEnv();
  const value = env[name as keyof WorkerEnv];
  return typeof value === "string" ? value : "";
}
