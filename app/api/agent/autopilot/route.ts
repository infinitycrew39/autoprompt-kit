import { NextResponse } from "next/server";

import { runAutopilotBatch } from "@/lib/autopilot";
import { verifyPaidPurchase } from "@/lib/purchase-access";

type AutopilotBody = {
  budgetCents?: number;
  promptAssetKey?: string;
  limit?: number;
  sessionId?: string;
};

function toPositiveInt(value: number, fallback: number) {
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : fallback;
}

function getDefaultBudgetCents() {
  return toPositiveInt(Number(process.env.AUTOPILOT_DEFAULT_BUDGET_CENTS ?? "5000"), 5000);
}

function getDefaultLimit() {
  return toPositiveInt(Number(process.env.AUTOPILOT_DEFAULT_LIMIT ?? "2"), 2);
}

function getDefaultPromptAssetKey() {
  return process.env.AUTOPILOT_DEFAULT_PROMPT_ASSET_KEY?.trim();
}

async function isAuthorized(request: Request, sessionId?: string) {
  const configuredToken = process.env.AUTOPILOT_TOKEN?.trim();
  const cronSecret = process.env.CRON_SECRET?.trim();

  const providedToken = request.headers.get("x-autopilot-token")?.trim();
  const authHeader = request.headers.get("authorization")?.trim();
  const bearerToken = authHeader?.toLowerCase().startsWith("bearer ")
    ? authHeader.slice(7).trim()
    : undefined;

  if (configuredToken && providedToken === configuredToken) {
    return true;
  }

  if (cronSecret && bearerToken === cronSecret) {
    return true;
  }

  if (sessionId) {
    const purchase = await verifyPaidPurchase(sessionId);
    return Boolean(purchase);
  }

  if (!configuredToken && !cronSecret) {
    return true;
  }

  return false;
}

async function runAutopilot(payload: AutopilotBody, request: Request) {
  const budgetCents = toPositiveInt(Number(payload.budgetCents ?? getDefaultBudgetCents()), getDefaultBudgetCents());
  const limit = toPositiveInt(Number(payload.limit ?? getDefaultLimit()), getDefaultLimit());
  const promptAssetKey = payload.promptAssetKey?.trim() || getDefaultPromptAssetKey();

  const origin = new URL(request.url).origin;
  const result = await runAutopilotBatch({
    origin,
    budgetCents,
    promptAssetKey,
    limit,
  });

  return NextResponse.json({ result });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AutopilotBody;
    if (!(await isAuthorized(request, body.sessionId?.trim()))) {
      return NextResponse.json({ error: "Unauthorized autopilot trigger." }, { status: 401 });
    }

    return runAutopilot(body, request);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Autopilot run failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const sessionId = url.searchParams.get("sessionId")?.trim();
    if (!(await isAuthorized(request, sessionId))) {
      return NextResponse.json({ error: "Unauthorized autopilot trigger." }, { status: 401 });
    }

    const payload: AutopilotBody = {
      budgetCents: Number(url.searchParams.get("budgetCents") ?? getDefaultBudgetCents()),
      limit: Number(url.searchParams.get("limit") ?? getDefaultLimit()),
      promptAssetKey: url.searchParams.get("promptAssetKey") ?? getDefaultPromptAssetKey(),
      sessionId,
    };

    return runAutopilot(payload, request);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Autopilot run failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
