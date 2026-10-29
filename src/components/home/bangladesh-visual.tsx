import { cn } from "@/lib/utils/cn";
import { getDictionary } from "@/lib/i18n/server";
import { BANGLADESH_DISTRICTS } from "./bangladesh-district-data";
import { BANGLADESH_MAP_SIZE } from "./bangladesh-map-constants";
import { BangladeshDistricts } from "./bangladesh-districts";

export async function BangladeshVisual({ className }: { className?: string }) {
  const { geo, home } = await getDictionary();
  const districts = BANGLADESH_DISTRICTS.map((district) => ({
    ...district,
    label: geo.districts[district.name as keyof typeof geo.districts] ?? district.name,
  }));
  const countryOutline = BANGLADESH_DISTRICTS.map((district) => district.path).join("");

  return (
    <div className={cn("relative aspect-[400/557] w-full", className)}>
      <div
        className="absolute inset-[-15%] animate-glow rounded-full bg-radial from-brand/25 via-brand/5 to-transparent to-70%"
        aria-hidden="true"
      />
      <svg
        viewBox={`0 0 ${BANGLADESH_MAP_SIZE.width} ${BANGLADESH_MAP_SIZE.height}`}
        className="pointer-events-none absolute inset-0 size-full overflow-visible"
        aria-hidden="true"
      >
        <path
          d={countryOutline}
          className="fill-card stroke-brand/45"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      </svg>
      <BangladeshDistricts
        districts={districts}
        mapLabel={home.mapLabel}
        highlightedLabel={home.mapDistrictHighlighted}
      />
    </div>
  );
}
