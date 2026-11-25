import { ImageResponse } from "next/og";
import { brand } from "@brand";

export const alt = `${brand.name} — cash for property, gold, and jewelry`;
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
          background: "#070B12",
          color: "#F4F0E6",
        }}
      >
        <svg width="220" height="220" viewBox="0 0 64 64">
          <g fill="none" stroke="#D4A93C" strokeWidth="3.2" strokeLinejoin="round" strokeLinecap="round">
            <path d="M7 44H57V56.5H7Z" />
            <path d="M7 44L13 27.6L19 44" />
            <path d="M57 44L51 27.6L45 44" />
            <path d="M19 44L32 24.4L45 44" />
          </g>
          <g fill="#D4A93C">
            <circle cx="13" cy="19.6" r="2.35" />
            <circle cx="32" cy="16.2" r="2.35" />
            <circle cx="51" cy="19.6" r="2.35" />
          </g>
        </svg>
        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 42,
            fontWeight: 650,
            letterSpacing: 8,
            color: "#D4A93C",
          }}
        >
          CROWN WHOLESALERS
        </div>
        <div style={{ display: "flex", marginTop: 18, fontSize: 28, color: "#F4F0E6" }}>
          Cash for property, gold, and jewelry
        </div>
      </div>
    ),
    { ...size },
  );
}
