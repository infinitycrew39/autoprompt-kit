export const PURCHASE_SESSION_STORAGE_KEY = "autoprompt_purchase_session_id";

export function savePurchaseSessionId(sessionId: string) {
  if (typeof window === "undefined") {
    return;
  }

  const trimmed = sessionId.trim();
  if (!trimmed) {
    return;
  }

  localStorage.setItem(PURCHASE_SESSION_STORAGE_KEY, trimmed);
}

export function readPurchaseSessionId() {
  if (typeof window === "undefined") {
    return "";
  }

  return localStorage.getItem(PURCHASE_SESSION_STORAGE_KEY)?.trim() ?? "";
}

export function clearPurchaseSessionId() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(PURCHASE_SESSION_STORAGE_KEY);
}
