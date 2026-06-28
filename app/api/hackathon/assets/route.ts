import { readFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

import { getPromptAssetByKey, listPromptAssets } from "@/lib/prompt-assets";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const key = url.searchParams.get("key")?.trim();

    if (!key) {
      return NextResponse.json({ assets: listPromptAssets() });
    }

    const asset = getPromptAssetByKey(key);
    if (!asset) {
      return NextResponse.json({ error: "Unknown asset key." }, { status: 404 });
    }

    const filePath = path.join(process.cwd(), "public", asset.publicPath.replace(/^\//, ""));
    const content = await readFile(filePath, "utf8");

    return NextResponse.json({
      asset,
      content,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to read prompt asset.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
