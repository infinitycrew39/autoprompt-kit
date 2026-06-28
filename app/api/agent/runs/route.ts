import { NextResponse } from "next/server";

import { listAgentRuns } from "@/lib/agent-runs";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get("limit") ?? "20");
    const runs = await listAgentRuns(limit);
    return NextResponse.json({ runs });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to list agent runs.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
