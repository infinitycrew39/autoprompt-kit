"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  readPurchaseSessionId,
  savePurchaseSessionId,
} from "@/lib/purchase-session-client";

type PromptAsset = {
  key: string;
  title: string;
  filename: string;
};

type RunResponse = {
  run: {
    id: string;
    objective: string;
    budgetCents: number;
    status: string;
    spentCents: number;
    projectedRevenueCents: number;
    plan: {
      provider: string;
      model: string;
      summary: string;
    };
    executedActions: Array<{
      type: string;
      title: string;
      status: string;
      amountCents: number;
      reason?: string;
      checkoutUrl?: string;
      provisionedResourceId?: string;
    }>;
  };
};

async function verifySession(sessionId: string) {
  const response = await fetch(
    `/api/hackathon/assets?session_id=${encodeURIComponent(sessionId)}`,
  );
  const data = (await response.json()) as { assets?: PromptAsset[]; plan?: string; error?: string };
  return { ok: response.ok && Boolean(data.assets), data };
}

export function HackathonConsole() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlSessionId = searchParams.get("session_id")?.trim() ?? "";

  const [sessionId, setSessionId] = useState("");
  const [sessionReady, setSessionReady] = useState(false);
  const [restoreInput, setRestoreInput] = useState("");
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [objective, setObjective] = useState(
    "Launch an AI growth sprint that can generate revenue and provision one SaaS tool safely.",
  );
  const [budgetCents, setBudgetCents] = useState(5000);
  const [loading, setLoading] = useState(false);
  const [autopilotLoading, setAutopilotLoading] = useState(false);
  const [assetsLoading, setAssetsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RunResponse["run"] | null>(null);
  const [assets, setAssets] = useState<PromptAsset[]>([]);
  const [plan, setPlan] = useState<string | null>(null);
  const [selectedAsset, setSelectedAsset] = useState("");
  const [assetPreview, setAssetPreview] = useState("");
  const [autopilotSummary, setAutopilotSummary] = useState<{
    count: number;
    spentCents: number;
    projectedRevenueCents: number;
    roiCents: number;
  } | null>(null);

  const activateSession = useCallback(
    (nextSessionId: string, replaceUrl = true) => {
      const trimmed = nextSessionId.trim();
      if (!trimmed) {
        return;
      }

      savePurchaseSessionId(trimmed);
      setSessionId(trimmed);
      setError(null);

      if (replaceUrl) {
        router.replace(`/hackathon?session_id=${encodeURIComponent(trimmed)}`);
      }
    },
    [router],
  );

  useEffect(() => {
    let cancelled = false;

    async function resolveSession() {
      const candidate = urlSessionId || readPurchaseSessionId();
      if (!candidate) {
        if (!cancelled) {
          setSessionReady(true);
        }
        return;
      }

      const verification = await verifySession(candidate);
      if (cancelled) {
        return;
      }

      if (verification.ok) {
        activateSession(candidate, !urlSessionId);
        if (!cancelled) {
          setSessionReady(true);
        }
        return;
      }

      if (!urlSessionId && readPurchaseSessionId() === candidate) {
        setError(verification.data.error ?? "Saved purchase session is no longer valid.");
      }

      if (!cancelled) {
        setSessionReady(true);
      }
    }

    void resolveSession();

    return () => {
      cancelled = true;
    };
  }, [urlSessionId, activateSession]);

  const loadAssets = useCallback(async () => {
    if (!sessionId) {
      setError("Purchase session required. Complete checkout to unlock purchased files.");
      return;
    }

    setAssetsLoading(true);
    setError(null);

    try {
      const verification = await verifySession(sessionId);
      if (!verification.ok || !verification.data.assets) {
        setAssets([]);
        setPlan(null);
        setError(verification.data.error ?? "Unable to load purchased assets.");
        return;
      }

      setAssets(verification.data.assets);
      setPlan(verification.data.plan ?? null);
      setSelectedAsset((current) => current || verification.data.assets?.[0]?.key || "");
    } catch {
      setError("Unable to load purchased assets.");
    } finally {
      setAssetsLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    if (sessionId) {
      void loadAssets();
    }
  }, [sessionId, loadAssets]);

  async function restoreAccess() {
    const trimmedEmail = restoreInput.trim();
    if (!trimmedEmail) {
      setError("Enter the Gmail you used at checkout.");
      return;
    }

    setRestoreLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/access/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail }),
      });

      const data = (await response.json()) as {
        sessionId?: string;
        plan?: string;
        error?: string;
      };

      if (!response.ok || !data.sessionId) {
        setError(data.error ?? "No paid purchase found for this email.");
        return;
      }

      activateSession(data.sessionId);
    } catch {
      setError("Unable to restore access from email.");
    } finally {
      setRestoreLoading(false);
    }
  }

  async function loadAssetPreview(key: string) {
    if (!sessionId || !key) {
      return;
    }

    try {
      const response = await fetch(
        `/api/hackathon/assets?session_id=${encodeURIComponent(sessionId)}&key=${encodeURIComponent(key)}`,
      );
      const data = (await response.json()) as { content?: string; error?: string };
      if (!response.ok || !data.content) {
        setAssetPreview("");
        return;
      }
      setAssetPreview(data.content.slice(0, 600));
    } catch {
      setAssetPreview("");
    }
  }

  async function runAgent() {
    if (!sessionId) {
      setError("Purchase session required. Complete checkout first.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/agent/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          objective,
          budgetCents,
          promptAssetKey: selectedAsset,
          sessionId,
        }),
      });

      const data = (await response.json()) as RunResponse | { error: string };
      if (!response.ok || !("run" in data)) {
        setError("error" in data ? data.error : "Run failed");
        setResult(null);
        return;
      }

      setResult(data.run);
    } catch {
      setError("Unable to execute run.");
    } finally {
      setLoading(false);
    }
  }

  async function runAutopilot() {
    if (!sessionId) {
      setError("Purchase session required. Complete checkout first.");
      return;
    }

    setAutopilotLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/agent/autopilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          budgetCents,
          promptAssetKey: selectedAsset,
          sessionId,
          limit: 2,
        }),
      });

      const data = (await response.json()) as
        | {
            result?: {
              count: number;
              spentCents: number;
              projectedRevenueCents: number;
              roiCents: number;
              runs?: Array<RunResponse["run"]>;
            };
            error?: string;
          }
        | { error: string };

      if (!response.ok || !("result" in data) || !data.result) {
        setError("error" in data ? (data.error ?? "Autopilot failed") : "Autopilot failed");
        setAutopilotSummary(null);
        return;
      }

      setAutopilotSummary({
        count: data.result.count,
        spentCents: data.result.spentCents,
        projectedRevenueCents: data.result.projectedRevenueCents,
        roiCents: data.result.roiCents,
      });

      if (Array.isArray(data.result.runs) && data.result.runs.length > 0) {
        setResult(data.result.runs[data.result.runs.length - 1]);
      }
    } catch {
      setError("Autopilot failed.");
      setAutopilotSummary(null);
    } finally {
      setAutopilotLoading(false);
    }
  }

  if (!sessionReady) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#0C1730]/70 p-5 text-sm text-slate-300">
        Checking purchase access...
      </div>
    );
  }

  if (!sessionId) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-6 text-amber-100">
          <h2 className="text-xl font-semibold text-white">Purchase Required</h2>
          <p className="mt-2 text-sm text-amber-100/90">
            Ops Console unlocks after a paid checkout. If you already purchased, restore access with
            your receipt session ID below.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/#pricing">View Pricing</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0C1730]/70 p-5">
          <h3 className="text-lg font-semibold text-white">Already purchased?</h3>
          <p className="mt-1 text-sm text-slate-300">
            Enter the Gmail you used at checkout. We will look up your paid order and restore access
            automatically.
          </p>
          <label className="mt-4 block text-sm text-slate-200">
            Purchase email
            <input
              value={restoreInput}
              onChange={(event) => setRestoreInput(event.target.value)}
              type="email"
              placeholder="you@gmail.com"
              className="mt-1 w-full rounded-xl border border-white/10 bg-[#081225] p-3 text-sm text-slate-100"
            />
          </label>
          <Button className="mt-3" onClick={restoreAccess} disabled={restoreLoading}>
            {restoreLoading ? "Looking up purchase..." : "Restore Access"}
          </Button>
        </div>

        {error ? (
          <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-200">
            {error}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-[#0C1730]/70 p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/80">Hackathon Ops Console</p>
        <h2 className="mt-2 text-xl font-semibold text-white">Autonomous Run</h2>
        <p className="mt-1 text-sm text-slate-300">
          Verified purchase session active{plan ? ` (${plan} plan)` : ""}. Agent plans with Nemotron
          when configured, applies NemoClaw policies, and executes Stripe skills.
        </p>

        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" onClick={loadAssets} disabled={assetsLoading}>
              {assetsLoading ? "Loading files..." : "Reload Purchased Files"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => loadAssetPreview(selectedAsset)}
              disabled={!selectedAsset}
            >
              Preview Selected File
            </Button>
            <Button type="button" onClick={runAutopilot} disabled={autopilotLoading || assets.length === 0}>
              {autopilotLoading ? "Autopilot Running..." : "Run Full Autopilot"}
            </Button>
          </div>

          <label className="block text-sm text-slate-200">
            Purchased file context
            <select
              value={selectedAsset}
              onChange={(event) => setSelectedAsset(event.target.value)}
              disabled={assets.length === 0}
              className="mt-1 w-full rounded-xl border border-white/10 bg-[#081225] p-3 text-sm text-slate-100 disabled:opacity-60"
            >
              {assets.length === 0 ? (
                <option value="">No purchased files loaded</option>
              ) : (
                assets.map((asset) => (
                  <option key={asset.key} value={asset.key}>
                    {asset.title}
                  </option>
                ))
              )}
            </select>
          </label>

          <label className="block text-sm text-slate-200">
            Objective
            <textarea
              value={objective}
              onChange={(event) => setObjective(event.target.value)}
              rows={3}
              className="mt-1 w-full rounded-xl border border-white/10 bg-[#081225] p-3 text-sm text-slate-100"
            />
          </label>

          <label className="block text-sm text-slate-200">
            Budget (cents)
            <input
              value={budgetCents}
              onChange={(event) => setBudgetCents(Number(event.target.value))}
              type="number"
              min={100}
              className="mt-1 w-full rounded-xl border border-white/10 bg-[#081225] p-3 text-sm text-slate-100"
            />
          </label>

          <Button onClick={runAgent} disabled={loading || !objective.trim() || assets.length === 0}>
            {loading ? "Running..." : "Run Autonomous Ops"}
          </Button>

          {assetPreview ? (
            <div className="rounded-xl border border-cyan-400/20 bg-cyan-500/5 p-3 text-xs text-cyan-100">
              <p className="font-semibold uppercase tracking-[0.12em] text-cyan-300">Asset Preview</p>
              <pre className="mt-2 overflow-auto whitespace-pre-wrap">{assetPreview}</pre>
            </div>
          ) : null}

          {autopilotSummary ? (
            <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/5 p-3 text-xs text-emerald-100">
              <p className="font-semibold uppercase tracking-[0.12em] text-emerald-300">Autopilot Summary</p>
              <p className="mt-2">
                Runs: {autopilotSummary.count} | Spent: ${(autopilotSummary.spentCents / 100).toFixed(2)} |
                Revenue: ${(autopilotSummary.projectedRevenueCents / 100).toFixed(2)} | ROI: $
                {(autopilotSummary.roiCents / 100).toFixed(2)}
              </p>
            </div>
          ) : null}
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-200">{error}</div>
      ) : null}

      {result ? (
        <div className="rounded-2xl border border-white/10 bg-[#0C1730]/70 p-5">
          {(() => {
            const roiCents = result.projectedRevenueCents - result.spentCents;
            const roiText = `${roiCents >= 0 ? "+" : "-"}$${(Math.abs(roiCents) / 100).toFixed(2)}`;
            return (
              <>
                <h3 className="text-lg font-semibold text-white">Run Result: {result.id}</h3>
                <p className="mt-1 text-sm text-slate-300">
                  Status: {result.status} | Provider: {result.plan.provider} | Model: {result.plan.model}
                </p>
                <p className="mt-1 text-sm text-slate-300">{result.plan.summary}</p>
                <p className="mt-2 text-sm text-slate-200">
                  Spent: ${(result.spentCents / 100).toFixed(2)} | Projected revenue: $
                  {(result.projectedRevenueCents / 100).toFixed(2)} | ROI:
                  <span className={roiCents >= 0 ? " text-emerald-300" : " text-rose-300"}> {roiText}</span>
                </p>
              </>
            );
          })()}

          <div className="mt-4 space-y-3">
            {result.executedActions.map((action, idx) => (
              <div key={`${action.title}-${idx}`} className="rounded-xl border border-white/10 bg-[#081225] p-3">
                <p className="text-sm font-semibold text-white">
                  {action.type.toUpperCase()} - {action.title}
                </p>
                <p className="text-xs text-slate-300">
                  Status: {action.status} | Amount: ${(action.amountCents / 100).toFixed(2)}
                </p>
                {action.reason ? <p className="mt-1 text-xs text-amber-300">{action.reason}</p> : null}
                {action.provisionedResourceId ? (
                  <p className="mt-1 text-xs text-cyan-300">Resource: {action.provisionedResourceId}</p>
                ) : null}
                {action.checkoutUrl ? (
                  <a
                    href={action.checkoutUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-block text-xs text-cyan-300 hover:text-cyan-200"
                  >
                    Open Stripe Skill URL
                  </a>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
