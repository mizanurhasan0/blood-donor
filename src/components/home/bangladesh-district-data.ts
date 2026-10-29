import boundaries from "@/features/requests/data/bangladesh-districts.json";
import { findDistrict } from "@/lib/constants/locations";
import { BANGLADESH_MAP_SIZE } from "./bangladesh-map-constants";

type Point = [longitude: number, latitude: number];
type Polygon = Point[][];
type DistrictBoundary = { name: string; polygons: Polygon[] };

const MAP_PADDING = 8;
const DISTRICT_NAME_ALIASES: Record<string, string> = {
  Barisal: "Barishal",
  Bogra: "Bogura",
  Brahamanbaria: "Brahmanbaria",
  Chittagong: "Chattogram",
  Comilla: "Cumilla",
  Jessore: "Jashore",
  Jhalokati: "Jhalokathi",
  Maulvibazar: "Moulvibazar",
  Netrakona: "Netrokona",
  Nawabganj: "Chapainawabganj",
};

const districtBoundaries = boundaries.features as DistrictBoundary[];
const allPoints = districtBoundaries.flatMap((district) =>
  district.polygons.flatMap((polygon) => polygon.flatMap((ring) => ring)),
);

function mercatorY(latitude: number) {
  const radians = (latitude * Math.PI) / 180;
  // Longitude is in degrees, so express Mercator latitude in degrees too.
  return (180 / Math.PI) * Math.log(Math.tan(Math.PI / 4 + radians / 2));
}

const longitudes = allPoints.map(([longitude]) => longitude);
const projectedLatitudes = allPoints.map(([, latitude]) => mercatorY(latitude));
const bounds = {
  minX: Math.min(...longitudes),
  maxX: Math.max(...longitudes),
  minY: Math.min(...projectedLatitudes),
  maxY: Math.max(...projectedLatitudes),
};

const scale = Math.min(
  (BANGLADESH_MAP_SIZE.width - MAP_PADDING * 2) / (bounds.maxX - bounds.minX),
  (BANGLADESH_MAP_SIZE.height - MAP_PADDING * 2) / (bounds.maxY - bounds.minY),
);
const offsetX = (BANGLADESH_MAP_SIZE.width - (bounds.maxX - bounds.minX) * scale) / 2;
const offsetY = (BANGLADESH_MAP_SIZE.height - (bounds.maxY - bounds.minY) * scale) / 2;

function project([longitude, latitude]: Point): [x: number, y: number] {
  return [
    offsetX + (longitude - bounds.minX) * scale,
    BANGLADESH_MAP_SIZE.height - offsetY - (mercatorY(latitude) - bounds.minY) * scale,
  ];
}

function polygonsToPath(polygons: Polygon[]) {
  return polygons
    .flatMap((polygon) =>
      polygon.map((ring) => {
        const [first, ...rest] = ring.map(project);
        if (!first) return "";

        return `M${first[0].toFixed(1)} ${first[1].toFixed(1)}${rest
          .map(([x, y]) => `L${x.toFixed(1)} ${y.toFixed(1)}`)
          .join("")}Z`;
      }),
    )
    .join("");
}

export const BANGLADESH_DISTRICTS = districtBoundaries.map((district) => {
  const points = district.polygons.flatMap((polygon) => polygon[0] ?? []).map(project);
  const xs = points.map(([x]) => x);
  const ys = points.map(([, y]) => y);
  const rawName = district.name;

  return {
    name: DISTRICT_NAME_ALIASES[rawName] ?? findDistrict(rawName) ?? rawName,
    path: polygonsToPath(district.polygons),
    center: [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2] as const,
  };
});
