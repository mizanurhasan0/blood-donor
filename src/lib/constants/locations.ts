/** Bangladesh divisions and their districts (64 in total). */
export const DIVISIONS = {
  Barishal: ["Barguna", "Barishal", "Bhola", "Jhalokathi", "Patuakhali", "Pirojpur"],
  Chattogram: [
    "Bandarban",
    "Brahmanbaria",
    "Chandpur",
    "Chattogram",
    "Cox's Bazar",
    "Cumilla",
    "Feni",
    "Khagrachhari",
    "Lakshmipur",
    "Noakhali",
    "Rangamati",
  ],
  Dhaka: [
    "Dhaka",
    "Faridpur",
    "Gazipur",
    "Gopalganj",
    "Kishoreganj",
    "Madaripur",
    "Manikganj",
    "Munshiganj",
    "Narayanganj",
    "Narsingdi",
    "Rajbari",
    "Shariatpur",
    "Tangail",
  ],
  Khulna: [
    "Bagerhat",
    "Chuadanga",
    "Jashore",
    "Jhenaidah",
    "Khulna",
    "Kushtia",
    "Magura",
    "Meherpur",
    "Narail",
    "Satkhira",
  ],
  Mymensingh: ["Jamalpur", "Mymensingh", "Netrokona", "Sherpur"],
  Rajshahi: ["Bogura", "Chapainawabganj", "Joypurhat", "Naogaon", "Natore", "Pabna", "Rajshahi", "Sirajganj"],
  Rangpur: [
    "Dinajpur",
    "Gaibandha",
    "Kurigram",
    "Lalmonirhat",
    "Nilphamari",
    "Panchagarh",
    "Rangpur",
    "Thakurgaon",
  ],
  Sylhet: ["Habiganj", "Moulvibazar", "Sunamganj", "Sylhet"],
} as const satisfies Record<string, readonly string[]>;

export type Division = keyof typeof DIVISIONS;
export type District = (typeof DIVISIONS)[Division][number];

export const DIVISION_NAMES = Object.keys(DIVISIONS) as Division[];

export const DISTRICTS: readonly { name: District; division: Division }[] = DIVISION_NAMES.flatMap(
  (division) => DIVISIONS[division].map((name) => ({ name: name as District, division })),
).sort((a, b) => a.name.localeCompare(b.name));

const districtToDivision = new Map<string, Division>(DISTRICTS.map((d) => [d.name, d.division]));

export const DISTRICT_NAMES = DISTRICTS.map((d) => d.name) as [District, ...District[]];

export function isDistrict(value: unknown): value is District {
  return typeof value === "string" && districtToDivision.has(value);
}

export function divisionOf(district: District): Division {
  return districtToDivision.get(district)!;
}

/** Case-insensitive lookup so URLs like ?district=dhaka resolve to "Dhaka". */
export function findDistrict(value: string | undefined | null): District | undefined {
  if (!value) return undefined;
  const needle = value.trim().toLowerCase();
  return DISTRICTS.find((d) => d.name.toLowerCase() === needle)?.name;
}
