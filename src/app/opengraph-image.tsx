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
          <g fill="none" stroke="#D4A93C" strokeWidth="3.25" strokeLinejoin="miter" strokeLinecap="butt">
            <path d="M8 42H56V56H8Z" />
            <path d="M8 42L15 24L26.3 33.8" />
            <path d="M56 42L49 24L37.7 33.8" />
            <path d="M22 42L32 8L42 42" />
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
