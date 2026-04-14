import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt =
  "Adelusi Dan Kunle — AI Engineer · Automation Architect · LLM Specialist";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          backgroundColor: "#0a0a0c",
          padding: "80px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Accent bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "3px",
              backgroundColor: "#ff5b1f",
            }}
          />
          <span
            style={{
              color: "rgba(245,241,232,0.6)",
              fontSize: "14px",
              letterSpacing: "3px",
              textTransform: "uppercase",
            }}
          >
            AI & Automation Architect · LLM Specialist · AI Engineer
          </span>
        </div>

        {/* Name */}
        <h1
          style={{
            color: "#f5f1e8",
            fontSize: "80px",
            fontWeight: 600,
            lineHeight: 0.95,
            letterSpacing: "-2px",
            margin: 0,
          }}
        >
          Adelusi
          <br />
          Dan Kunle.
        </h1>

        {/* Lede */}
        <p
          style={{
            color: "rgba(245,241,232,0.7)",
            fontSize: "24px",
            lineHeight: 1.5,
            maxWidth: "700px",
            marginTop: "32px",
          }}
        >
          Shipping production AI products, agent systems and automation
          pipelines for clients across UK · US · Canada · Dubai · and beyond.
        </p>

        {/* Availability */}
        <div
          style={{
            display: "flex",
            marginTop: "40px",
            gap: "8px",
          }}
        >
          <span
            style={{
              color: "#ff5b1f",
              fontSize: "13px",
              letterSpacing: "2px",
              textTransform: "uppercase",
            }}
          >
            Available: Freelance · Contract · Remote · Full-Time
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
