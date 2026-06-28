import { readFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

import { canAccessAssetKey, getPromptAssetByKey } from "@/lib/prompt-assets";
import { verifyPaidPurchase } from "@/lib/purchase-access";

function contentTypeForFilename(filename: string) {
  if (filename.endsWith(".pdf")) {
    return "application/pdf";
  }
  if (filename.endsWith(".zip")) {
    return "application/zip";
  }
  return "text/markdown; charset=utf-8";
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const sessionId = url.searchParams.get("session_id")?.trim();
    const fileKey = url.searchParams.get("file")?.trim();

    if (!sessionId || !fileKey) {
      return NextResponse.json({ error: "Missing session_id or file." }, { status: 400 });
    }

    const purchase = await verifyPaidPurchase(sessionId);
    if (!purchase) {
      return NextResponse.json({ error: "Purchase not found or not paid." }, { status: 403 });
    }

    if (!canAccessAssetKey(purchase.plan, fileKey)) {
      return NextResponse.json({ error: "This file is not included in your plan." }, { status: 403 });
    }

    const asset = getPromptAssetByKey(fileKey);
    if (!asset) {
      return NextResponse.json({ error: "Unknown file." }, { status: 404 });
    }

    const filePath = path.join(process.cwd(), "content", "downloads", asset.filename);
    const content = await readFile(filePath);

    return new Response(content, {
      status: 200,
      headers: {
        "Content-Type": contentTypeForFilename(asset.filename),
        "Content-Disposition": `attachment; filename="${asset.filename}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Download failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
