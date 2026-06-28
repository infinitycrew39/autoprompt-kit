import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

import type { AgentRunRecord } from "@/lib/agent-types";

type AgentRunDb = {
  runs: AgentRunRecord[];
};

function getRunsPath() {
  return process.env.AGENT_RUNS_DATA_PATH?.trim()
    ? process.env.AGENT_RUNS_DATA_PATH
    : path.join(process.cwd(), "data", "agent-runs.json");
}

async function ensureDbFile() {
  const filePath = getRunsPath();
  await mkdir(path.dirname(filePath), { recursive: true });

  try {
    await stat(filePath);
  } catch {
    const initial: AgentRunDb = { runs: [] };
    await writeFile(filePath, JSON.stringify(initial, null, 2), "utf8");
  }

  return filePath;
}

async function readDb(): Promise<AgentRunDb> {
  const filePath = await ensureDbFile();
  const raw = await readFile(filePath, "utf8");

  try {
    const parsed = JSON.parse(raw) as Partial<AgentRunDb>;
    return {
      runs: Array.isArray(parsed.runs) ? parsed.runs : [],
    };
  } catch {
    return { runs: [] };
  }
}

async function writeDb(db: AgentRunDb) {
  const filePath = await ensureDbFile();
  await writeFile(filePath, JSON.stringify(db, null, 2), "utf8");
}

export async function createAgentRun(record: AgentRunRecord) {
  const db = await readDb();
  db.runs.unshift(record);
  await writeDb(db);
}

export async function listAgentRuns(limit = 20) {
  const db = await readDb();
  return db.runs.slice(0, Math.max(1, limit));
}

export async function getAgentRunById(id: string) {
  const db = await readDb();
  return db.runs.find((run) => run.id === id) ?? null;
}
