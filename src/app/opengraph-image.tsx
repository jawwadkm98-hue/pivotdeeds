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
          justifyContent: "space-between",
          background: "#090E18",
          color: "#F4F1E8",
          padding: "72px",
        }}
      >
        <div style={{ display: "flex", fontSize: 28, letterSpacing: 6, color: "#E8C97A" }}>{brand.name.toUpperCase()}</div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 72, lineHeight: 1.02, fontWeight: 600 }}>
          <div>Cash for property,</div>
          <div>gold, and jewelry.</div>
        </div>
        <div style={{ display: "flex", fontSize: 28, color: "#E7DCC8" }}>Nationwide · No obligation · All 50 states</div>
      </div>
    ),
    { ...size },
  );
}
