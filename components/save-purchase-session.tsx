"use client";

import { useEffect } from "react";

import { savePurchaseSessionId } from "@/lib/purchase-session-client";

type SavePurchaseSessionProps = {
  sessionId: string;
};

export function SavePurchaseSession({ sessionId }: SavePurchaseSessionProps) {
  useEffect(() => {
    if (sessionId) {
      savePurchaseSessionId(sessionId);
    }
  }, [sessionId]);

  return null;
}
