import type { GuardrailVerdict } from "@/lib/agent-types";

type GuardrailInput = {
  budgetCents: number;
  currentSpentCents: number;
  actionAmountCents: number;
  vendor?: string;
};

const BLOCKED_VENDOR_KEYWORDS = ["gambling", "adult", "weapons"];

export function evaluateNemoClawPolicy(input: GuardrailInput): GuardrailVerdict {
  const maxBudget = Number(process.env.AGENT_MAX_BUDGET_CENTS ?? "50000");

  if (input.budgetCents > maxBudget) {
    return {
      allow: false,
      reason: `Budget ${input.budgetCents} exceeds AGENT_MAX_BUDGET_CENTS=${maxBudget}.`,
    };
  }

  const afterSpend = input.currentSpentCents + input.actionAmountCents;
  if (afterSpend > input.budgetCents) {
    return {
      allow: false,
      reason: `Action would exceed run budget (${afterSpend}/${input.budgetCents}).`,
    };
  }

  const loweredVendor = (input.vendor ?? "").toLowerCase();
  if (BLOCKED_VENDOR_KEYWORDS.some((word) => loweredVendor.includes(word))) {
    return {
      allow: false,
      reason: "Vendor category is blocked by NemoClaw policy.",
    };
  }

  return { allow: true, reason: "Allowed by NemoClaw policy." };
}
