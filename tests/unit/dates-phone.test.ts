import { describe, expect, it } from "vitest";
import {
  addDays,
  endOfBangladeshDay,
  formatDate,
  formatLongDate,
  formatRelative,
  isPastNeededDate,
  toBangladeshDate,
  todayInBangladesh,
} from "@/lib/utils/dates";
import { maskPhone, normalizeBdPhone } from "@/lib/utils/phone";

describe("Bangladesh dates (UTC+6)", () => {
  it("rolls over to the next day at 18:00 UTC", () => {
    expect(todayInBangladesh(new Date("2026-03-10T17:59:59.999Z"))).toBe("2026-03-10");
    expect(todayInBangladesh(new Date("2026-03-10T18:00:00.000Z"))).toBe("2026-03-11");
    expect(todayInBangladesh(new Date("2026-12-31T18:00:00.000Z"))).toBe("2027-01-01");
  });

  it("ends a Bangladesh day at 17:59:59.999 UTC", () => {
    expect(endOfBangladeshDay("2026-03-11").toISOString()).toBe("2026-03-11T17:59:59.999Z");
  });

  it("maps the end of a day back to the same calendar date", () => {
    const end = endOfBangladeshDay("2026-03-11");
    expect(toBangladeshDate(end)).toBe("2026-03-11");
    expect(toBangladeshDate(new Date(end.getTime() + 1))).toBe("2026-03-12");
  });

  it("adds days across month, year and leap-day boundaries", () => {
    expect(addDays("2026-01-31", 1)).toBe("2026-02-01");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2028-02-28", 1)).toBe("2028-02-29");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
    expect(addDays("2026-03-11", 60)).toBe("2026-05-10");
  });

  it("formats in Dhaka time regardless of the server timezone", () => {
    // 19:00 UTC on the 10th is already the 11th in Dhaka (and still the 10th in New York).
    const instant = new Date("2026-03-10T19:00:00Z");
    expect(formatLongDate(instant)).toBe("11 March 2026");
    expect(formatDate(instant)).toBe("11 Mar 2026");
    expect(formatLongDate(endOfBangladeshDay("2026-03-11"))).toBe("11 March 2026");
  });

  it("describes relative times against a fixed clock", () => {
    const now = new Date("2026-03-10T12:00:00Z");
    expect(formatRelative(new Date("2026-03-10T11:59:30Z"), now)).toBe("just now");
    expect(formatRelative(new Date("2026-03-10T10:00:00Z"), now)).toBe("2 hours ago");
    expect(formatRelative(new Date("2026-03-09T12:00:00Z"), now)).toBe("yesterday");
    expect(formatRelative("2026-03-13T12:00:00Z", now)).toBe("in 3 days");
  });

  it("knows when a needed-by moment has passed", () => {
    const now = new Date("2026-03-11T18:00:00Z");
    expect(isPastNeededDate(endOfBangladeshDay("2026-03-11"), now)).toBe(true);
    expect(isPastNeededDate(endOfBangladeshDay("2026-03-12"), now)).toBe(false);
  });
});

describe("normalizeBdPhone", () => {
  it.each([
    ["01712345678", "01712345678"],
    ["+8801712345678", "01712345678"],
    ["8801512345678", "01512345678"],
    ["+880 1712-345 678", "01712345678"],
    ["(017) 1234-5678", "01712345678"],
  ])("normalises %j", (input, expected) => {
    expect(normalizeBdPhone(input)).toBe(expected);
  });

  it.each([
    "01012345678",
    "01112345678",
    "01212345678",
    "1712345678",
    "0171234567",
    "+91 9876543210",
    "01712abc678",
  ])("rejects %j", (input) => {
    expect(normalizeBdPhone(input)).toBeNull();
  });
});

describe("maskPhone", () => {
  it("keeps only the operator prefix and the last three digits", () => {
    expect(maskPhone("01712345678")).toBe("017•••••678");
    expect(maskPhone("01712345678")).not.toContain("12345");
  });
});
