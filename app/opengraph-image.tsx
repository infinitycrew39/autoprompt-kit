import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "AutoPrompt Kit 2026";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "64px",
          background:
            "radial-gradient(circle at 20% 15%, rgba(99,102,241,0.45), transparent 40%), radial-gradient(circle at 85% 20%, rgba(34,211,238,0.35), transparent 35%), #0A1428",
          color: "white",
        }}
      >
        <p style={{ fontSize: 28, letterSpacing: "0.22em", textTransform: "uppercase", color: "#67E8F9" }}>
          Premium Prompt Packs
        </p>
        <h1 style={{ marginTop: 20, fontSize: 76, lineHeight: 1.05, fontWeight: 700 }}>
          AutoPrompt Kit 2026
        </h1>
        <p style={{ marginTop: 24, maxWidth: 880, fontSize: 30, color: "#CBD5E1" }}>
          Unlock the full power of autonomous AI agents.
        </p>
      </div>
    ),
    {
      ...size,
    },
  );
}
