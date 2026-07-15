import { ImageResponse } from "next/og";

export const alt = "Mowlid Haibe — Malitos · Devmalitos";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#070707",
          color: "#f2ecdf",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          Mowlid Haibe
        </div>
        <div
          style={{
            marginTop: 16,
            fontSize: 32,
            color: "#34d399",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}
        >
          Malitos · Devmalitos
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 24,
            color: "#b8b2a4",
            maxWidth: 800,
            textAlign: "center",
            lineHeight: 1.4,
          }}
        >
          Full-stack software engineer & AI innovator · Next.js · React · Malaysia
        </div>
      </div>
    ),
    { ...size },
  );
}
