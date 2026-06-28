import fs from "node:fs";
import path from "node:path";

import Stripe from "stripe";

function readEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const raw = fs.readFileSync(filePath, "utf8");
  return Object.fromEntries(
    raw
      .split("\n")
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const idx = line.indexOf("=");
        return [line.slice(0, idx), line.slice(idx + 1)];
      }),
  );
}

const envPath = path.join(process.cwd(), ".env.local");
const env = readEnvFile(envPath);
const secret = env.STRIPE_WEBHOOK_SECRET;

if (!secret) {
  console.error("Missing STRIPE_WEBHOOK_SECRET in .env.local");
  process.exit(1);
}

const payloadObj = {
  id: `evt_local_${Date.now()}`,
  object: "event",
  type: "checkout.session.completed",
  data: {
    object: {
      id: `cs_local_${Date.now()}`,
      object: "checkout.session",
      payment_status: "paid",
      amount_total: 9900,
      currency: "usd",
      metadata: { plan: "professional", product: "autoprompt-kit-2026" },
      customer_details: { email: "buyer@example.com" },
    },
  },
};

const payload = JSON.stringify(payloadObj);
const signature = Stripe.webhooks.generateTestHeaderString({ payload, secret });

const response = await fetch("http://localhost:3000/api/stripe/webhook", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "stripe-signature": signature,
  },
  body: payload,
});

const body = await response.text();
console.log(`STATUS=${response.status}`);
console.log(body);
