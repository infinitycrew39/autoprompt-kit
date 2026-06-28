import type { NemotronPlan, NemotronPlanAction } from "@/lib/agent-types";

type NvidiaChatResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

function parsePlanContent(raw: string): NemotronPlanAction[] {
  try {
    const parsed = JSON.parse(raw) as { actions?: NemotronPlanAction[] };
    if (!Array.isArray(parsed.actions)) {
      return [];
    }
    return parsed.actions.filter((item) => typeof item?.title === "string");
  } catch {
    return [];
  }
}

function fallbackPlan(): NemotronPlan {
  return {
    provider: "fallback",
    model: "fallback-planner-v1",
    summary: "Fallback planner generated a safe 4-step business ops run.",
    actions: [
      {
        type: "analyze",
        title: "Analyze market and define KPI baseline",
        notes: "Create 2-week execution baseline.",
      },
      {
        type: "earn",
        title: "Launch a revenue checkout offer",
        amountCents: 3500,
        notes: "Use Stripe skill to generate payment flow.",
      },
      {
        type: "spend",
        title: "Procure one SaaS tool for distribution",
        amountCents: 900,
        vendor: "EmailOps Cloud",
      },
      {
        type: "provision",
        title: "Provision SaaS workspace for campaign operations",
        amountCents: 900,
        vendor: "EmailOps Cloud",
      },
    ],
  };
}

export async function generateNemotronPlan(objective: string): Promise<NemotronPlan> {
  const apiKey = process.env.NVIDIA_API_KEY;
  const baseUrl = process.env.NVIDIA_NIM_BASE_URL?.trim() || "https://integrate.api.nvidia.com/v1";
  const model = process.env.NVIDIA_NEMOTRON_MODEL?.trim() || "nvidia/nemotron-3-ultra-550b-a55b";

  if (!apiKey) {
    return fallbackPlan();
  }

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content:
              "You are a business operations planner. Output strict JSON only in shape: {\"summary\": string, \"actions\": [{\"type\":\"analyze|earn|spend|provision\",\"title\": string, \"amountCents\"?: number, \"vendor\"?: string, \"notes\"?: string}] }",
          },
          {
            role: "user",
            content: `Objective: ${objective}. Build a practical plan where an agent can earn, spend, and provision tools safely.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      return fallbackPlan();
    }

    const payload = (await response.json()) as NvidiaChatResponse;
    const content = payload.choices?.[0]?.message?.content ?? "";
    const actions = parsePlanContent(content);

    if (actions.length === 0) {
      return fallbackPlan();
    }

    return {
      provider: "nemotron",
      model,
      summary: `Nemotron planned ${actions.length} actions for autonomous business operations.`,
      actions,
    };
  } catch {
    return fallbackPlan();
  }
}
