"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

type PromptAsset = {
  key: string;
  title: string;
  publicPath: string;
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

export function HackathonConsole() {
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
  const [selectedAsset, setSelectedAsset] = useState("starter-pack");
  const [assetPreview, setAssetPreview] = useState("");
  const [autopilotSummary, setAutopilotSummary] = useState<{
    count: number;
    spentCents: number;
    projectedRevenueCents: number;
    roiCents: number;
  } | null>(null);

  async function loadAssets() {
    setAssetsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/hackathon/assets");
      const data = (await response.json()) as { assets?: PromptAsset[]; error?: string };
      if (!response.ok || !data.assets) {
        setError(data.error ?? "Unable to load purchased assets.");
        return;
      }

      setAssets(data.assets);
    } catch {
      setError("Unable to load purchased assets.");
    } finally {
      setAssetsLoading(false);
    }
  }

  async function loadAssetPreview(key: string) {
    try {
      const response = await fetch(`/api/hackathon/assets?key=${encodeURIComponent(key)}`);
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
    setAutopilotLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/agent/autopilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          budgetCents,
          promptAssetKey: selectedAsset,
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

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-[#0C1730]/70 p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/80">Hackathon Ops Console</p>
        <h2 className="mt-2 text-xl font-semibold text-white">Autonomous Run</h2>
        <p className="mt-1 text-sm text-slate-300">
          Agent plans with Nemotron (when configured), applies NemoClaw policies, and executes Stripe
          skills for earn/spend/provision.
        </p>

        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" onClick={loadAssets} disabled={assetsLoading}>
              {assetsLoading ? "Loading files..." : "Load Purchased Files"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => loadAssetPreview(selectedAsset)}
              disabled={!selectedAsset}
            >
              Preview Selected File
            </Button>
            <Button
              type="button"
              onClick={runAutopilot}
              disabled={autopilotLoading}
            >
              {autopilotLoading ? "Autopilot Running..." : "Run Full Autopilot"}
            </Button>
          </div>

          <label className="block text-sm text-slate-200">
            Purchased file context
            <select
              value={selectedAsset}
              onChange={(event) => setSelectedAsset(event.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-[#081225] p-3 text-sm text-slate-100"
            >
              {(assets.length > 0
                ? assets
                : [
                    { key: "starter-pack", title: "Starter Prompt Pack", publicPath: "" },
                    { key: "starter-qa", title: "Prompt QA Checklist", publicPath: "" },
                    { key: "master-index", title: "Master Index", publicPath: "" },
                    {
                      key: "workflow-blueprints",
                      title: "Workflow Blueprints",
                      publicPath: "",
                    },
                  ]
              ).map((asset) => (
                <option key={asset.key} value={asset.key}>
                  {asset.title}
                </option>
              ))}
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

          <Button onClick={runAgent} disabled={loading || !objective.trim()}>
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
