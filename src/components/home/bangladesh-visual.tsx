import { cn } from "@/lib/utils/cn";
import { BANGLADESH_PATH } from "./bangladesh-path";

/**
 * Decorative map: the eight division headquarters plus Cox's Bazar, linked to
 * Dhaka. Purely illustrative — it does not show donor or patient locations.
 */
const CITIES = [
  { name: "Rangpur", x: 108, y: 83 },
  { name: "Rajshahi", x: 50, y: 213 },
  { name: "Mymensingh", x: 208, y: 178 },
  { name: "Sylhet", x: 333, y: 164 },
  { name: "Dhaka", x: 207, y: 266 },
  { name: "Khulna", x: 131, y: 357 },
  { name: "Barishal", x: 202, y: 371 },
  { name: "Chattogram", x: 326, y: 404 },
  { name: "Cox's Bazar", x: 345, y: 492 },
] as const;

const HUB = CITIES[4];

const EXTRA_LINKS: [number, number][] = [
  [0, 1],
  [2, 3],
  [5, 6],
  [7, 8],
  [3, 7],
];

function arc(a: { x: number; y: number }, b: { x: number; y: number }, bend = 0.22) {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const cx = mx - (b.y - a.y) * bend;
  const cy = my + (b.x - a.x) * bend;
  return `M${a.x} ${a.y}Q${cx.toFixed(1)} ${cy.toFixed(1)} ${b.x} ${b.y}`;
}

function Pin({ x, y, delay }: { x: number; y: number; delay: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle
        r="7"
        className="origin-center animate-marker-pulse fill-brand/40 [transform-box:fill-box]"
        style={{ animationDelay: `${delay}ms` }}
      />
      <path d="M0 0c-5-6.5-8.5-10.6-8.5-15.3a8.5 8.5 0 0 1 17 0C8.5-10.6 5-6.5 0 0Z" className="fill-brand" />
      <circle cy="-15.3" r="3.2" className="fill-foreground" />
    </g>
  );
}

export function BangladeshVisual({ className }: { className?: string }) {
  return (
    <div className={cn("relative aspect-[400/557] w-full", className)} aria-hidden="true">
      <div className="absolute inset-[-15%] animate-glow rounded-full bg-radial from-brand/25 via-brand/5 to-transparent to-70%" />
      <svg viewBox="-12 -24 424 590" className="relative size-full overflow-visible">
        <defs>
          <pattern id="bd-dots" width="7" height="7" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="1" className="fill-outline" />
          </pattern>
          <clipPath id="bd-clip">
            <path d={BANGLADESH_PATH} />
          </clipPath>
        </defs>
        <path d={BANGLADESH_PATH} className="fill-card" />
        <rect width="400" height="557" fill="url(#bd-dots)" clipPath="url(#bd-clip)" opacity="0.8" />
        <path
          d={BANGLADESH_PATH}
          className="fill-none stroke-brand/45"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <g className="fill-none stroke-brand" strokeWidth="1.3" strokeLinecap="round">
          {CITIES.filter((c) => c !== HUB).map((city) => (
            <path key={city.name} d={arc(HUB, city)} className="opacity-60" />
          ))}
          {EXTRA_LINKS.map(([a, b]) => (
            <path
              key={`${a}-${b}`}
              d={arc(CITIES[a], CITIES[b], -0.18)}
              strokeDasharray="4 8"
              className="animate-dash opacity-50"
            />
          ))}
        </g>
        {CITIES.map((city, i) => (
          <Pin key={city.name} x={city.x} y={city.y} delay={i * 260} />
        ))}
      </svg>
    </div>
  );
}
