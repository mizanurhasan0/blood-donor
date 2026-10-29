import { describe, expect, it } from "vitest";
import { BANGLADESH_DISTRICTS } from "@/components/home/bangladesh-district-data";
import { BANGLADESH_MAP_SIZE } from "@/components/home/bangladesh-map-constants";
import { DISTRICT_NAMES } from "@/lib/constants/locations";

describe("Bangladesh map geometry", () => {
  it("provides one named shape for each of the 64 districts", () => {
    expect(BANGLADESH_DISTRICTS.map(({ name }) => name).sort()).toEqual([...DISTRICT_NAMES].sort());
  });

  it("fits the country in the viewBox without flattening its latitude", () => {
    const coordinates = BANGLADESH_DISTRICTS.flatMap(({ path }) =>
      [...path.matchAll(/-?\d+(?:\.\d+)?/g)].map(([value]) => Number(value)),
    );
    const xs = coordinates.filter((_, index) => index % 2 === 0);
    const ys = coordinates.filter((_, index) => index % 2 === 1);
    const width = Math.max(...xs) - Math.min(...xs);
    const height = Math.max(...ys) - Math.min(...ys);

    expect(coordinates.every(Number.isFinite)).toBe(true);
    expect(Math.min(...xs)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...xs)).toBeLessThanOrEqual(BANGLADESH_MAP_SIZE.width);
    expect(Math.min(...ys)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...ys)).toBeLessThanOrEqual(BANGLADESH_MAP_SIZE.height);
    expect(height).toBeGreaterThan(500);
    expect(width / height).toBeGreaterThan(0.65);
    expect(width / height).toBeLessThan(0.8);
  });
});
