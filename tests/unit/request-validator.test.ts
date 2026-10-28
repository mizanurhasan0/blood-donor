import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { bloodRequestSchema, parseRequestFilters, requestFiltersSchema } from "@/lib/validators/request";

// 2026-03-10 19:00 UTC is already 2026-03-11 01:00 in Bangladesh (UTC+6).
const NOW = new Date("2026-03-10T19:00:00Z");
const TODAY_BD = "2026-03-11";
const USER_ID = "65f1c0ffee0000000000abcd";

function validInput(overrides: Record<string, unknown> = {}) {
  return {
    bloodGroup: "B+",
    units: 2,
    hospitalName: "Dhaka Medical College Hospital",
    district: "Dhaka",
    neededDate: "2026-03-12",
    contactPhone: "01712345678",
    description: "Patient needs blood for surgery.",
    urgency: "urgent",
    allowPhoneReveal: true,
    shareDocumentWithDonors: false,
    ...overrides,
  };
}

function fieldErrors(input: unknown): Record<string, string[] | undefined> {
  const result = bloodRequestSchema.safeParse(input);
  expect(result.success).toBe(false);
  return result.success ? {} : z.flattenError(result.error).fieldErrors;
}

describe("bloodRequestSchema", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(NOW);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("accepts a complete request and normalises form values", () => {
    const values = bloodRequestSchema.parse(
      validInput({
        units: "3",
        hospitalName: "  Dhaka Medical\u0007 College  ",
        contactPhone: " +880 1712-345678 ",
        description: "  Needed before noon.\u0000  ",
      }),
    );
    expect(values).toMatchObject({
      units: 3,
      hospitalName: "Dhaka Medical College",
      contactPhone: "01712345678",
      description: "Needed before noon.",
    });
    expect(values.documentKey).toBeUndefined();
  });

  it("reports every missing required field", () => {
    const errors = fieldErrors({});
    expect(Object.keys(errors).sort()).toEqual(
      [
        "allowPhoneReveal",
        "bloodGroup",
        "contactPhone",
        "description",
        "district",
        "hospitalName",
        "neededDate",
        "shareDocumentWithDonors",
        "units",
        "urgency",
      ].sort(),
    );
  });

  it.each([
    ["01712345678", "01712345678"],
    ["+8801712345678", "01712345678"],
    ["8801912345678", "01912345678"],
    ["017 1234 5678", "01712345678"],
    ["(+88) 01312-345678", "01312345678"],
  ])("normalises the phone number %s", (input, expected) => {
    expect(bloodRequestSchema.parse(validInput({ contactPhone: input })).contactPhone).toBe(expected);
  });

  it.each(["01212345678", "0171234567", "017123456789", "+447911123456", "+8811712345678", "", "call me"])(
    "rejects the phone number %j",
    (contactPhone) => {
      expect(fieldErrors(validInput({ contactPhone })).contactPhone).toEqual(["bdPhoneInvalid"]);
    },
  );

  it("uses the Bangladesh calendar day, not UTC, for 'today'", () => {
    expect(bloodRequestSchema.safeParse(validInput({ neededDate: TODAY_BD })).success).toBe(true);
    // Still the 10th in UTC and in the server's timezone, but already past in Dhaka.
    expect(fieldErrors(validInput({ neededDate: "2026-03-10" })).neededDate).toEqual(["neededDatePast"]);
  });

  it("allows dates up to 60 days ahead and rejects anything later", () => {
    expect(bloodRequestSchema.safeParse(validInput({ neededDate: "2026-05-10" })).success).toBe(true);
    expect(fieldErrors(validInput({ neededDate: "2026-05-11" })).neededDate).toEqual(["neededDateTooFar"]);
  });

  it.each(["11/03/2026", "2026-3-12", "2026-02-30", "tomorrow"])(
    "rejects the malformed date %j",
    (neededDate) => {
      expect(fieldErrors(validInput({ neededDate })).neededDate).toBeDefined();
    },
  );

  it("accepts a document key issued by the upload route", () => {
    const documentKey = `prescriptions/${USER_ID}/AbCdEfGh_ijkl-MNOP1234.pdf`;
    expect(bloodRequestSchema.parse(validInput({ documentKey })).documentKey).toBe(documentKey);
  });

  it.each([
    "prescriptions/../../etc/passwd",
    `prescriptions/${USER_ID}/short.png`,
    `prescriptions/${USER_ID}/AbCdEfGh_ijkl-MNOP1234.svg`,
    `prescriptions/${USER_ID}/AbCdEfGh/ijkl-MNOP1234.png`,
    `uploads/${USER_ID}/AbCdEfGh_ijkl-MNOP1234.png`,
    "prescriptions/not-an-object-id-at-all/AbCdEfGh_ijkl-MNOP1234.png",
    "https://evil.example/prescriptions/x.png",
  ])("rejects the document key %j", (documentKey) => {
    expect(fieldErrors(validInput({ documentKey })).documentKey).toEqual(["documentKeyInvalid"]);
  });

  it("limits the description to 600 characters after trimming", () => {
    expect(bloodRequestSchema.safeParse(validInput({ description: "a".repeat(600) })).success).toBe(true);
    expect(bloodRequestSchema.safeParse(validInput({ description: `  ${"a".repeat(600)}  ` })).success).toBe(
      true,
    );
    expect(bloodRequestSchema.safeParse(validInput({ description: "" })).success).toBe(true);
    expect(fieldErrors(validInput({ description: "a".repeat(601) })).description).toEqual([
      "descriptionTooLong",
    ]);
  });

  it.each([0, -1, 11, 1.5, "abc"])("rejects %j units", (units) => {
    expect(fieldErrors(validInput({ units })).units).toBeDefined();
  });

  it.each([1, 10, "4"])("accepts %j units", (units) => {
    expect(bloodRequestSchema.safeParse(validInput({ units })).success).toBe(true);
  });

  it("rejects unknown blood groups, districts and urgencies", () => {
    const errors = fieldErrors(validInput({ bloodGroup: "C+", district: "Gotham", urgency: "asap" }));
    expect(errors.bloodGroup).toEqual(["bloodGroupRequired"]);
    expect(errors.district).toEqual(["districtRequired"]);
    expect(errors.urgency).toBeDefined();
  });

  it("requires a meaningful hospital name", () => {
    expect(fieldErrors(validInput({ hospitalName: "  x " })).hospitalName).toEqual(["hospitalRequired"]);
  });
});

describe("requestFiltersSchema / parseRequestFilters", () => {
  it("defaults to published requests on page 1", () => {
    expect(parseRequestFilters({})).toEqual({ status: "published", page: 1 });
  });

  it("parses a complete, valid filter set", () => {
    expect(
      parseRequestFilters({
        bloodGroup: "O-",
        district: "Khulna",
        urgency: "urgent",
        status: "fulfilled",
        needed: "3d",
        q: "Khulna Medical",
        page: "2",
      }),
    ).toEqual({
      bloodGroup: "O-",
      district: "Khulna",
      urgency: "urgent",
      status: "fulfilled",
      needed: "3d",
      q: "Khulna Medical",
      page: 2,
    });
  });

  it("silently drops invalid values instead of failing", () => {
    expect(
      parseRequestFilters({
        bloodGroup: "C+",
        urgency: "asap",
        needed: "1y",
        district: "Gotham",
        page: "abc",
      }),
    ).toEqual({ status: "published", page: 1 });
  });

  it.each(["pending", "rejected", "PUBLISHED", ""])("never exposes the non-public status %j", (status) => {
    expect(parseRequestFilters({ status }).status).toBe("published");
  });

  it.each([
    ["dhaka", "Dhaka"],
    ["  COX'S BAZAR ", "Cox's Bazar"],
    ["chattogram", "Chattogram"],
  ])("matches the district %j case-insensitively", (district, expected) => {
    expect(parseRequestFilters({ district }).district).toBe(expected);
  });

  it.each([
    ["3", 3],
    ["500", 500],
    ["0", 1],
    ["501", 1],
    ["2.5", 1],
    ["-4", 1],
  ])("clamps page %j to %d", (page, expected) => {
    expect(parseRequestFilters({ page }).page).toBe(expected);
  });

  it("cleans and bounds the search text", () => {
    expect(parseRequestFilters({ q: "  blood\u0000 bank  " }).q).toBe("blood bank");
    expect(parseRequestFilters({ q: "x".repeat(100) }).q).toHaveLength(60);
    expect(parseRequestFilters({ q: "   " }).q).toBeUndefined();
  });

  it("takes the first value of repeated query keys", () => {
    expect(parseRequestFilters({ bloodGroup: ["AB-", "O+"], district: ["sylhet", "Dhaka"] })).toMatchObject({
      bloodGroup: "AB-",
      district: "Sylhet",
    });
  });

  it("never throws on hostile input", () => {
    expect(requestFiltersSchema.safeParse({ page: { $gt: 1 }, district: ["$where"], q: 42 }).success).toBe(
      true,
    );
  });
});
