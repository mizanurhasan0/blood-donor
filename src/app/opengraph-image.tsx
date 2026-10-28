import { ImageResponse } from "next/og";
import { SITE } from "@/lib/constants/site";

export const alt = `${SITE.name} — ${SITE.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** ImageResponse can't read CSS variables, so these literals mirror the tokens in globals.css. */
const COLORS = {
  background: "#06121d",
  card: "#102635",
  outline: "#243b4c",
  brand: "#ff2442",
  brandGlow: "rgba(255, 36, 66, 0.28)",
  foreground: "#f8fafc",
  muted: "#a7b7c8",
} as const;

const DROP_PATH =
  "M12 1.2c.4 0 .8.2 1 .6 1.9 3.1 4.3 6.2 6.2 9.4 1.9 3.1 3.1 5.8 3.1 8.6C22.3 26 17.7 30.8 12 30.8S1.7 26 1.7 19.8c0-2.8 1.2-5.5 3.1-8.6C6.7 8 9.1 4.9 11 1.8c.2-.4.6-.6 1-.6Z";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "0 96px",
        backgroundColor: COLORS.background,
        backgroundImage: `radial-gradient(circle at 85% 15%, ${COLORS.brandGlow}, transparent 55%)`,
        color: COLORS.foreground,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
        <svg width="120" height="160" viewBox="0 0 24 32">
          <path fill={COLORS.brand} d={DROP_PATH} />
          <path
            fill={COLORS.foreground}
            fillOpacity={0.85}
            d="M7.2 20.4c.6 0 1 .4 1 1 0 1.6 1.2 3 2.8 3.3a1 1 0 1 1-.3 2 5.4 5.4 0 0 1-4.5-5.3c0-.6.4-1 1-1Z"
          />
        </svg>
        <div
          style={{
            display: "flex",
            fontSize: 112,
            fontWeight: 700,
            letterSpacing: -3,
          }}
        >
          <span>Blood</span>
          <span style={{ color: COLORS.brand }}>Link</span>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          marginTop: 40,
          fontSize: 48,
          fontWeight: 600,
        }}
      >
        {SITE.tagline}
      </div>
      <div
        style={{
          display: "flex",
          marginTop: 20,
          fontSize: 30,
          color: COLORS.muted,
          maxWidth: 900,
        }}
      >
        Free community platform connecting voluntary blood donors with people in need.
      </div>
      <div
        style={{
          display: "flex",
          marginTop: 56,
          alignSelf: "flex-start",
          padding: "14px 28px",
          borderRadius: 999,
          border: `2px solid ${COLORS.outline}`,
          backgroundColor: COLORS.card,
          fontSize: 26,
          color: COLORS.muted,
        }}
      >
        Never pay or accept payment for blood
      </div>
    </div>,
    size,
  );
}
