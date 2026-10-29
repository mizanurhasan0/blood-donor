"use client";

import { useId, useState, type KeyboardEvent } from "react";
import { BANGLADESH_MAP_SIZE } from "./bangladesh-map-constants";

type DistrictShape = { name: string; path: string; center: readonly [number, number] };

function DistrictShapePath({
  district,
  patternId,
  onActivate,
  onDeactivate,
}: {
  district: DistrictShape;
  patternId: string;
  onActivate: (district: DistrictShape) => void;
  onDeactivate: () => void;
}) {
  return (
    <g>
      <path d={district.path} className="fill-card" />
      <path d={district.path} fill={`url(#${patternId})`} className="pointer-events-none" />
      <path
        d={district.path}
        data-district={district.name}
        fill="transparent"
        className="stroke-brand/40 transition-[stroke,filter] duration-150 ease-out hover:stroke-brand focus-visible:stroke-brand"
        strokeWidth="0.85"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        onPointerEnter={() => onActivate(district)}
        onPointerLeave={onDeactivate}
      />
    </g>
  );
}

function DistrictTooltip({ district }: { district: DistrictShape }) {
  const [x, y] = district.center;

  return (
    <div
      className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-full border border-outline/70 bg-elevated/95 px-3 py-1.5 text-xs font-semibold text-foreground shadow-popover backdrop-blur-sm"
      style={{
        left: `${(x / BANGLADESH_MAP_SIZE.width) * 100}%`,
        top: `${(y / BANGLADESH_MAP_SIZE.height) * 100}%`,
      }}
      aria-hidden="true"
    >
      {district.name}
    </div>
  );
}

export function BangladeshDistricts({ districts }: { districts: DistrictShape[] }) {
  const [activeDistrict, setActiveDistrict] = useState<DistrictShape | null>(null);
  const patternId = `bangladesh-dots-${useId().replaceAll(":", "")}`;

  function handleKeyDown(event: KeyboardEvent<SVGSVGElement>) {
    if (event.key === "Escape") {
      setActiveDistrict(null);
      return;
    }

    const step = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1;
    if (!event.key.startsWith("Arrow")) return;

    event.preventDefault();
    const currentIndex = districts.findIndex((district) => district.name === activeDistrict?.name);
    const nextIndex =
      currentIndex < 0
        ? step === 1
          ? 0
          : districts.length - 1
        : (currentIndex + step + districts.length) % districts.length;
    setActiveDistrict(districts[nextIndex] ?? null);
  }

  return (
    <div className="relative size-full">
      <svg
        viewBox={`0 0 ${BANGLADESH_MAP_SIZE.width} ${BANGLADESH_MAP_SIZE.height}`}
        className="relative size-full overflow-visible"
        role="group"
        aria-label="Bangladesh districts map. Use the arrow keys to explore districts."
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onBlur={() => setActiveDistrict(null)}
      >
        <defs>
          <pattern id={patternId} width="7" height="7" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="1" className="fill-outline" />
          </pattern>
        </defs>
        {districts.map((district) => (
          <DistrictShapePath
            key={district.name}
            district={district}
            patternId={patternId}
            onActivate={setActiveDistrict}
            onDeactivate={() => setActiveDistrict(null)}
          />
        ))}
        {activeDistrict && (
          <path
            d={activeDistrict.path}
            data-highlighted-district={activeDistrict.name}
            className="pointer-events-none fill-brand/30 stroke-brand drop-shadow-[0_0_7px_var(--color-brand)]"
            strokeWidth="1.8"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        )}
      </svg>
      {activeDistrict && <DistrictTooltip district={activeDistrict} />}
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        {activeDistrict ? `${activeDistrict.name} district highlighted.` : ""}
      </span>
    </div>
  );
}
