// app/opengraph-image.tsx
import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: "#09090b",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "80px",
          position: "relative",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Orange glow behind title */}
        <div
          style={{
            position: "absolute",
            top: 80,
            left: 300,
            width: 600,
            height: 400,
            background:
              "radial-gradient(circle, rgba(249,115,22,0.18) 0%, rgba(9,9,11,0) 70%)",
            borderRadius: "50%",
            display: "flex",
          }}
        />

        {/* Domain badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "rgba(249,115,22,0.12)",
            border: "1px solid rgba(249,115,22,0.35)",
            borderRadius: 999,
            padding: "6px 18px",
            marginBottom: 44,
          }}
        >
          <span style={{ color: "#f97316", fontSize: 20, fontWeight: 600 }}>
            renderpdf.vercel.app
          </span>
        </div>

        {/* Title: "RenderPDF" — "PDF" in orange */}
        <div style={{ display: "flex", alignItems: "baseline" }}>
          <span
            style={{
              color: "white",
              fontSize: 88,
              fontWeight: 800,
              lineHeight: 1,
              letterSpacing: "-2px",
            }}
          >
            {"Render\u00A0"}
          </span>
          <span
            style={{
              color: "#f97316",
              fontSize: 88,
              fontWeight: 800,
              lineHeight: 1,
              letterSpacing: "-2px",
            }}
          >PDF</span>
        </div>

        {/* Subtitle */}
        <div
          style={{
            display: "flex",
            color: "#a1a1aa",
            fontSize: 30,
            marginTop: 28,
            lineHeight: 1.5,
            maxWidth: 720,
          }}
        >
          Convert HTML &amp; CSS into pixel-perfect PDFs instantly
        </div>

        {/* Bottom-right pill */}
        <div
          style={{
            position: "absolute",
            bottom: 64,
            right: 80,
            background: "#f97316",
            borderRadius: 999,
            padding: "12px 28px",
            color: "white",
            fontSize: 22,
            fontWeight: 600,
            display: "flex",
          }}
        >
          Free · Fast · No Signup
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
