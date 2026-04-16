import { ImageResponse } from "next/og";

export const size = { width: 48, height: 48 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          background: "#0a0a0c",
          border: "2px solid rgba(245, 241, 232, 0.16)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "serif",
          fontSize: 28,
          color: "#f5f1e8",
        }}
      >
        a
      </div>
    ),
    { ...size }
  );
}
