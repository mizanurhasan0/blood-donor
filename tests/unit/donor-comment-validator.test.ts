import { describe, expect, it } from "vitest";
import { z } from "zod";
import { commentSchema } from "@/lib/validators/comment";
import { donorProfileSchema, preferencesSchema } from "@/lib/validators/donor";

const REQUEST_ID = "65f1c0ffee0000000000abcd";
const PARENT_ID = "65f1c0ffee0000000000dcba";

function errorsOf(schema: z.ZodType, input: unknown) {
  const result = schema.safeParse(input);
  expect(result.success).toBe(false);
  return result.success
    ? {}
    : (z.flattenError(result.error).fieldErrors as Record<string, string[] | undefined>);
}

describe("donorProfileSchema", () => {
  const valid = {
    fullName: "  Rahim Uddin ",
    bloodGroup: "O+",
    district: "Sylhet",
    area: " Zindabazar ",
    phone: "+8801812345678",
    available: true,
    emailNotifications: false,
  };

  it("cleans names and normalises the phone number", () => {
    expect(donorProfileSchema.parse(valid)).toEqual({
      fullName: "Rahim Uddin",
      bloodGroup: "O+",
      district: "Sylhet",
      area: "Zindabazar",
      phone: "01812345678",
      available: true,
      emailNotifications: false,
    });
  });

  it("treats phone and area as optional when left blank", () => {
    expect(donorProfileSchema.parse({ ...valid, phone: "  ", area: "" })).toMatchObject({
      phone: "",
      area: "",
    });
  });

  it("rejects an invalid phone number", () => {
    expect(errorsOf(donorProfileSchema, { ...valid, phone: "12345" }).phone).toEqual([
      "Enter a valid Bangladeshi mobile number",
    ]);
  });

  it("bounds the name and area lengths", () => {
    expect(errorsOf(donorProfileSchema, { ...valid, fullName: " A " }).fullName).toEqual([
      "Enter your full name",
    ]);
    expect(errorsOf(donorProfileSchema, { ...valid, fullName: "A".repeat(81) }).fullName).toEqual([
      "Keep it under 80 characters",
    ]);
    expect(errorsOf(donorProfileSchema, { ...valid, area: "x".repeat(81) }).area).toEqual([
      "Keep it under 80 characters",
    ]);
  });

  it("requires real booleans for the consent flags", () => {
    const errors = errorsOf(donorProfileSchema, {
      ...valid,
      available: "true",
      emailNotifications: undefined,
    });
    expect(errors.available).toBeDefined();
    expect(errors.emailNotifications).toBeDefined();
  });

  it("rejects unknown blood groups and districts", () => {
    const errors = errorsOf(donorProfileSchema, { ...valid, bloodGroup: "B", district: "dhaka" });
    expect(errors.bloodGroup).toEqual(["Select a blood group"]);
    expect(errors.district).toEqual(["Select a district"]);
  });
});

describe("preferencesSchema", () => {
  it("accepts partial updates and drops any other field", () => {
    expect(preferencesSchema.partial().parse({ available: false, bloodGroup: "A+", role: "admin" })).toEqual({
      available: false,
    });
  });

  it("rejects non-boolean flags", () => {
    expect(preferencesSchema.partial().safeParse({ emailNotifications: "no" }).success).toBe(false);
  });
});

describe("commentSchema", () => {
  it("trims the content and accepts an optional parent", () => {
    expect(commentSchema.parse({ requestId: REQUEST_ID, content: "  I can donate today.  " })).toEqual({
      requestId: REQUEST_ID,
      content: "I can donate today.",
    });
    expect(
      commentSchema.parse({ requestId: REQUEST_ID, parentId: PARENT_ID, content: "Thanks!" }).parentId,
    ).toBe(PARENT_ID);
  });

  it("strips control characters but keeps line breaks", () => {
    expect(
      commentSchema.parse({ requestId: REQUEST_ID, content: "Line one\u0000\nLine\u0007 two\u001b" }).content,
    ).toBe("Line one\nLine two");
  });

  it.each(["", "   ", " a ", "\u0000\u0001x\u0002"])("rejects %j as too short once cleaned", (content) => {
    expect(errorsOf(commentSchema, { requestId: REQUEST_ID, content }).content).toEqual([
      "Write a little more",
    ]);
  });

  it("allows up to 1000 characters", () => {
    expect(
      commentSchema.safeParse({ requestId: REQUEST_ID, content: `  ${"a".repeat(1000)}  ` }).success,
    ).toBe(true);
    expect(errorsOf(commentSchema, { requestId: REQUEST_ID, content: "a".repeat(1001) }).content).toEqual([
      "Keep it under 1000 characters",
    ]);
  });

  it("rejects malformed ids", () => {
    const errors = errorsOf(commentSchema, {
      requestId: "123",
      parentId: { $ne: null },
      content: "Hello there",
    });
    expect(errors.requestId).toEqual(["Invalid id"]);
    expect(errors.parentId).toBeDefined();
  });
});
