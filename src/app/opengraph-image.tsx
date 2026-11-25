import { ImageResponse } from "next/og";
import { brand } from "@brand";

export const alt = `${brand.name} — nationwide cash property buyers`;
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
          background: "#10241C",
          color: "#F4EFE6",
          padding: "72px",
        }}
      >
        <div style={{ display: "flex", fontSize: 28, letterSpacing: 6, color: "#E4C27A" }}>{brand.name.toUpperCase()}</div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 76, lineHeight: 1.02, fontWeight: 600 }}>
          <div>Sell the property.</div>
          <div>Skip the listing.</div>
        </div>
        <div style={{ display: "flex", fontSize: 28, color: "#E7DCC8" }}>
          Cash offers in all 50 states · Houses, land, and commercial
        </div>
      </div>
    ),
    { ...size },
  );
}
