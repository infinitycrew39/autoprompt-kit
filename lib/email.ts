import type { PlanId } from "@/lib/site-data";

import type { SecuredDownloadItem } from "@/lib/secured-downloads";

type SendDeliveryEmailInput = {
  to: string;
  plan: PlanId;
  downloads: SecuredDownloadItem[];
  sessionId: string;
  origin: string;
};

function planLabel(plan: PlanId) {
  return plan.charAt(0).toUpperCase() + plan.slice(1);
}

function buildHtml(plan: PlanId, downloads: SecuredDownloadItem[], sessionId: string, origin: string) {
  const items = downloads
    .map(
      (item) =>
        `<li style="margin-bottom:8px;"><a href="${item.href}" style="color:#2563eb;text-decoration:none;">${item.name}</a></li>`,
    )
    .join("");

  const opsConsoleUrl = `${origin}/hackathon?session_id=${encodeURIComponent(sessionId)}`;

  return `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;">
      <h2 style="margin-bottom:8px;">Your AutoPrompt Kit 2026 Access Is Ready</h2>
      <p>Thanks for purchasing the <strong>${planLabel(plan)}</strong> plan.</p>
      <p>Download your files below:</p>
      <ul>${items}</ul>
      <p style="margin-top:16px;"><a href="${opsConsoleUrl}" style="color:#2563eb;text-decoration:none;">Open Ops Console</a> to run autonomous workflows with your purchased prompt files.</p>
      <p style="margin-top:16px;color:#475569;">Keep this email to regain access to your downloads and Ops Console.</p>
    </div>
  `;
}

export async function sendDeliveryEmail({
  to,
  plan,
  downloads,
  sessionId,
  origin,
}: SendDeliveryEmailInput): Promise<{ sent: boolean; reason?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  const overrideRecipient = process.env.DELIVERY_OVERRIDE_EMAIL;
  const targetEmail = overrideRecipient && overrideRecipient.trim() ? overrideRecipient : to;

  if (!apiKey || !from) {
    return { sent: false, reason: "Missing RESEND_API_KEY or RESEND_FROM" };
  }

  const send = async (fromAddress: string) => {
    return fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: fromAddress,
        to: targetEmail,
        subject: `Your AutoPrompt Kit 2026 (${planLabel(plan)}) downloads`,
        html: buildHtml(plan, downloads, sessionId, origin),
      }),
    });
  };

  let response = await send(from);

  if (!response.ok) {
    const body = await response.text();
    const canFallback =
      response.status === 403 &&
      body.includes("domain is not verified") &&
      !from.includes("onboarding@resend.dev");

    if (canFallback) {
      const displayName = from.includes("<") ? from.split("<")[0].trim() : "AutoPrompt Kit";
      const fallbackFrom = `${displayName} <onboarding@resend.dev>`;
      response = await send(fallbackFrom);
      if (response.ok) {
        return { sent: true, reason: "Fallback sender used: onboarding@resend.dev" };
      }

      const fallbackBody = await response.text();
      return {
        sent: false,
        reason: `Resend fallback failed: ${response.status} ${fallbackBody}`,
      };
    }

    return { sent: false, reason: `Resend API failed: ${response.status} ${body}` };
  }

  return { sent: true };
}
