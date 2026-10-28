import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Literal colours for ImageResponse; they mirror --color-background / --color-brand in globals.css. */
const COLORS = {
  background: "#06121d",
  brand: "#ff2442",
  foreground: "#f8fafc",
} as const;

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: COLORS.background,
      }}
    >
      <svg width="90" height="120" viewBox="0 0 24 32">
        <path
          fill={COLORS.brand}
          d="M12 1.2c.4 0 .8.2 1 .6 1.9 3.1 4.3 6.2 6.2 9.4 1.9 3.1 3.1 5.8 3.1 8.6C22.3 26 17.7 30.8 12 30.8S1.7 26 1.7 19.8c0-2.8 1.2-5.5 3.1-8.6C6.7 8 9.1 4.9 11 1.8c.2-.4.6-.6 1-.6Z"
        />
        <path
          fill={COLORS.foreground}
          fillOpacity={0.85}
          d="M7.2 20.4c.6 0 1 .4 1 1 0 1.6 1.2 3 2.8 3.3a1 1 0 1 1-.3 2 5.4 5.4 0 0 1-4.5-5.3c0-.6.4-1 1-1Z"
        />
      </svg>
    </div>,
    size,
  );
}
