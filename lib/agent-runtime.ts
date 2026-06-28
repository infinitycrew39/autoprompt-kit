import { randomUUID } from "node:crypto";

import { createAgentRun } from "@/lib/agent-runs";
import type { AgentRunRecord, ExecutedAction } from "@/lib/agent-types";
import { evaluateNemoClawPolicy } from "@/lib/nemo-claw";
import { generateNemotronPlan } from "@/lib/nvidia";
import { createProcurementSkill, createRevenueCheckoutSkill } from "@/lib/stripe-skills";

type RunInput = {
  objective: string;
  budgetCents: number;
  origin: string;
};

function safeAmount(value: number | undefined) {
  return Number.isFinite(value) && value && value > 0 ? Math.floor(value) : 0;
}

export async function runAutonomousBusinessOps(input: RunInput) {
  const plan = await generateNemotronPlan(input.objective);
  const runId = `run_${randomUUID()}`;

  const executedActions: ExecutedAction[] = [];
  let spentCents = 0;
  let projectedRevenueCents = 0;

  for (const action of plan.actions) {
    const amountCents = safeAmount(action.amountCents);

    if (action.type === "analyze") {
      executedActions.push({
        type: "analyze",
        title: action.title,
        status: "executed",
        amountCents: 0,
      });
      continue;
    }

    if (action.type === "earn") {
      const earnAmount = amountCents || 3500;
      const skill = await createRevenueCheckoutSkill({
        origin: input.origin,
        title: action.title,
        amountCents: earnAmount,
        metadata: {
          runId,
          objective: input.objective.slice(0, 120),
        },
      });

      projectedRevenueCents += earnAmount;
      executedActions.push({
        type: "earn",
        title: action.title,
        status: skill.mode === "live" ? "executed" : "simulated",
        amountCents: earnAmount,
        checkoutUrl: skill.checkoutUrl,
      });
      continue;
    }

    if (action.type === "spend" || action.type === "provision") {
      const plannedAmount = amountCents || 1000;
      const verdict = evaluateNemoClawPolicy({
        budgetCents: input.budgetCents,
        currentSpentCents: spentCents,
        actionAmountCents: plannedAmount,
        vendor: action.vendor,
      });

      if (!verdict.allow) {
        executedActions.push({
          type: action.type,
          title: action.title,
          status: "blocked",
          amountCents: plannedAmount,
          reason: verdict.reason,
        });
        continue;
      }

      const skill = await createProcurementSkill({
        origin: input.origin,
        title: `${action.vendor ?? "SaaS"}: ${action.title}`,
        amountCents: plannedAmount,
        metadata: {
          runId,
          vendor: action.vendor ?? "unknown",
        },
      });

      spentCents += plannedAmount;
      executedActions.push({
        type: action.type,
        title: action.title,
        status: skill.mode === "live" ? "executed" : "simulated",
        amountCents: plannedAmount,
        checkoutUrl: skill.checkoutUrl,
        provisionedResourceId:
          action.type === "provision" ? `prov_${randomUUID().slice(0, 8)}` : undefined,
      });
    }
  }

  const hasBlocked = executedActions.some((step) => step.status === "blocked");

  const record: AgentRunRecord = {
    id: runId,
    objective: input.objective,
    budgetCents: input.budgetCents,
    origin: input.origin,
    status: hasBlocked ? "completed_with_blocks" : "completed",
    plan,
    executedActions,
    spentCents,
    projectedRevenueCents,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await createAgentRun(record);
  return record;
}
