import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type { PlanId } from "@/lib/site-data";

export type OrderRecord = {
  sessionId: string;
  plan: PlanId | "unknown";
  customerEmail: string;
  amountTotal: number;
  currency: string;
  paymentStatus: string;
  deliveryEmailSent: boolean;
  deliveryEmailReason?: string;
  createdAt: string;
  updatedAt: string;
};

type OrdersDb = {
  orders: OrderRecord[];
  processedWebhookEvents?: string[];
};

const MAX_PROCESSED_WEBHOOK_EVENTS = 1000;

function getOrdersPath() {
  return process.env.ORDERS_DATA_PATH?.trim()
    ? process.env.ORDERS_DATA_PATH
    : path.join(process.cwd(), "data", "orders.json");
}

async function ensureDbFile() {
  const filePath = getOrdersPath();
  const dirPath = path.dirname(filePath);
  await mkdir(dirPath, { recursive: true });

  try {
    await readFile(filePath, "utf8");
  } catch {
    const initial: OrdersDb = { orders: [] };
    await writeFile(filePath, JSON.stringify(initial, null, 2), "utf8");
  }

  return filePath;
}

async function readDb(): Promise<OrdersDb> {
  const filePath = await ensureDbFile();
  const raw = await readFile(filePath, "utf8");

  try {
    const parsed = JSON.parse(raw) as OrdersDb;
    if (!Array.isArray(parsed.orders)) {
      return { orders: [], processedWebhookEvents: [] };
    }
    return {
      orders: parsed.orders,
      processedWebhookEvents: Array.isArray(parsed.processedWebhookEvents)
        ? parsed.processedWebhookEvents
        : [],
    };
  } catch {
    return { orders: [], processedWebhookEvents: [] };
  }
}

async function writeDb(db: OrdersDb) {
  const filePath = await ensureDbFile();
  await writeFile(filePath, JSON.stringify(db, null, 2), "utf8");
}

export async function upsertOrder(record: Omit<OrderRecord, "createdAt" | "updatedAt">) {
  const db = await readDb();
  const now = new Date().toISOString();

  const idx = db.orders.findIndex((item) => item.sessionId === record.sessionId);
  if (idx >= 0) {
    db.orders[idx] = {
      ...db.orders[idx],
      ...record,
      updatedAt: now,
    };
  } else {
    db.orders.unshift({
      ...record,
      createdAt: now,
      updatedAt: now,
    });
  }

  await writeDb(db);
}

export async function getOrderBySessionId(sessionId: string) {
  const db = await readDb();
  return db.orders.find((item) => item.sessionId === sessionId) ?? null;
}

export async function listRecentOrders(limit = 20) {
  const db = await readDb();
  return db.orders.slice(0, Math.max(1, limit));
}

export async function hasProcessedWebhookEvent(eventId: string) {
  const db = await readDb();
  return (db.processedWebhookEvents ?? []).includes(eventId);
}

export async function markWebhookEventProcessed(eventId: string) {
  const db = await readDb();
  const set = new Set(db.processedWebhookEvents ?? []);
  set.add(eventId);

  db.processedWebhookEvents = Array.from(set).slice(-MAX_PROCESSED_WEBHOOK_EVENTS);
  await writeDb(db);
}
