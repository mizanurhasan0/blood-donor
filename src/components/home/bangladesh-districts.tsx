"use client";

import { useId, useState, type KeyboardEvent } from "react";
import { BANGLADESH_MAP_SIZE } from "./bangladesh-map-constants";
import { useDistrictRotation } from "./use-district-rotation";

type DistrictShape = { name: string; label: string; path: string; center: readonly [number, number] };

function DistrictShapePath({
  district,
  patternId,
  onActivate,
}: {
  district: DistrictShape;
  patternId: string;
  onActivate: () => void;
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
        onPointerEnter={onActivate}
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
      {district.label}
    </div>
  );
}

export function BangladeshDistricts({
  districts,
  mapLabel,
  highlightedLabel,
}: {
  districts: DistrictShape[];
  mapLabel: string;
  highlightedLabel: string;
}) {
  const [pointerInside, setPointerInside] = useState(false);
  const [focused, setFocused] = useState(false);
  const paused = pointerInside || focused;
  const [activeIndex, setActiveIndex] = useDistrictRotation(districts.length, paused);
  const activeDistrict = activeIndex === null ? null : districts[activeIndex];
  const patternId = `bangladesh-dots-${useId().replaceAll(":", "")}`;

  function handleKeyDown(event: KeyboardEvent<SVGSVGElement>) {
    if (event.key === "Escape") {
      setActiveIndex(null);
      return;
    }

    const step = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1;
    if (!event.key.startsWith("Arrow")) return;

    event.preventDefault();
    const currentIndex = activeIndex ?? -1;
    const nextIndex =
      currentIndex < 0
        ? step === 1
          ? 0
          : districts.length - 1
        : (currentIndex + step + districts.length) % districts.length;
    setActiveIndex(districts.length ? nextIndex : null);
  }

  return (
    <div
      className="relative size-full"
      onPointerEnter={() => setPointerInside(true)}
      onPointerLeave={() => setPointerInside(false)}
      onPointerCancel={() => setPointerInside(false)}
    >
      <svg
        viewBox={`0 0 ${BANGLADESH_MAP_SIZE.width} ${BANGLADESH_MAP_SIZE.height}`}
        className="relative size-full overflow-visible"
        role="group"
        aria-label={mapLabel}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      >
        <defs>
          <pattern id={patternId} width="7" height="7" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="1" className="fill-outline" />
          </pattern>
        </defs>
        {districts.map((district, index) => (
          <DistrictShapePath
            key={district.name}
            district={district}
            patternId={patternId}
            onActivate={() => setActiveIndex(index)}
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
        {focused && activeDistrict ? highlightedLabel.replace("{district}", activeDistrict.label) : ""}
      </span>
    </div>
  );
}
