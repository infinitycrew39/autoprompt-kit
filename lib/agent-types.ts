export type AgentActionType = "analyze" | "earn" | "spend" | "provision";

export type AgentActionStatus = "executed" | "blocked" | "simulated";

export type RunStatus = "completed" | "completed_with_blocks" | "failed";

export type NemotronPlanAction = {
  type: AgentActionType;
  title: string;
  amountCents?: number;
  vendor?: string;
  notes?: string;
};

export type NemotronPlan = {
  provider: "nemotron" | "fallback";
  model: string;
  summary: string;
  actions: NemotronPlanAction[];
};

export type GuardrailVerdict = {
  allow: boolean;
  reason: string;
};

export type ExecutedAction = {
  type: AgentActionType;
  title: string;
  status: AgentActionStatus;
  amountCents: number;
  reason?: string;
  checkoutUrl?: string;
  provisionedResourceId?: string;
};

export type AgentRunRecord = {
  id: string;
  objective: string;
  budgetCents: number;
  origin: string;
  status: RunStatus;
  plan: NemotronPlan;
  executedActions: ExecutedAction[];
  spentCents: number;
  projectedRevenueCents: number;
  createdAt: string;
  updatedAt: string;
};
