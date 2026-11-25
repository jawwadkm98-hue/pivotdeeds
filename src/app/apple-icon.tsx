import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0B1F3A",
        }}
      >
        <svg width="128" height="128" viewBox="0 0 64 64">
          <g fill="none" stroke="#D4A93C" strokeWidth="3.25" strokeLinejoin="miter" strokeLinecap="butt">
            <path d="M8 42H56V56H8Z" />
            <path d="M8 42L15 24L26.3 33.8" />
            <path d="M56 42L49 24L37.7 33.8" />
            <path d="M22 42L32 8L42 42" />
          </g>
        </svg>
      </div>
    ),
    { ...size },
  );
}
