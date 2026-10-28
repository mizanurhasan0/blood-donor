import { expect, IDS, test } from "./fixtures";

// Runs last: approving the pending request changes what other specs see.
test.describe("moderation", () => {
  test("non-admins see not-found", async ({ page, signIn }) => {
    await signIn(IDS.donor);
    await page.goto("/admin/requests");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/couldn't find/i);
    await expect(page.getByRole("button", { name: "Approve" })).toHaveCount(0);
  });

  test("admin approves a pending request and it goes live", async ({ page, signIn }) => {
    await signIn(IDS.admin);
    await page.goto("/admin/requests");
    const card = page.getByRole("article").filter({ hasText: "Sylhet MAG Osmani Medical College" });
    await card.getByRole("button", { name: "Approve" }).click();
    await expect(page.getByText(/Published/).first()).toBeVisible();

    const response = await page.goto(`/requests/${IDS.requestPending.toHexString()}`);
    expect(response?.status()).toBe(200);
    await expect(page.getByText("Sylhet MAG Osmani Medical College").first()).toBeVisible();
  });
});
