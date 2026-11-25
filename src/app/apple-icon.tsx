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
      </div>
    ),
    { ...size },
  );
}
