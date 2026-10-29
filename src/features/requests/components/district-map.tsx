import { BANGLADESH_DISTRICTS } from "@/components/home/bangladesh-district-data";
import { BANGLADESH_MAP_SIZE } from "@/components/home/bangladesh-map-constants";
import type { District } from "@/lib/constants/locations";

export function DistrictMap({ district, className }: { district: District; className?: string }) {
  const selected = BANGLADESH_DISTRICTS.find((item) => item.name === district);

  return (
    <svg
      viewBox={`0 0 ${BANGLADESH_MAP_SIZE.width} ${BANGLADESH_MAP_SIZE.height}`}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {BANGLADESH_DISTRICTS.filter((item) => item !== selected).map((item) => (
        <path
          key={item.name}
          d={item.path}
          fill="#102c3d"
          stroke="#39708e"
          strokeWidth="0.65"
          strokeLinejoin="round"
        />
      ))}
      {selected && (
        <>
          <path
            d={selected.path}
            fill="#7dd3fc"
            fillOpacity="0.82"
            stroke="#38bdf8"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          <circle cx={selected.center[0]} cy={selected.center[1]} r="7" fill="#ff2442" fillOpacity="0.25" />
          <circle cx={selected.center[0]} cy={selected.center[1]} r="3.5" fill="#ff5a6e" />
        </>
      )}
    </svg>
  );
}
