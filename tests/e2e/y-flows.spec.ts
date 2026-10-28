import { expect, IDS, test } from "./fixtures";

const dhaka = `/requests/${IDS.requestDhaka.toHexString()}`;

function isoDate(daysFromNow: number) {
  return new Date(Date.now() + 6 * 3_600_000 + daysFromNow * 86_400_000).toISOString().slice(0, 10);
}

test.describe("signed-in flows", () => {
  test("donor registration", async ({ page, signIn }) => {
    await signIn(IDS.newcomer);
    await page.goto("/become-donor");
    await page.getByLabel("Full name").fill("Nadia Islam");
    await page.getByLabel("A+", { exact: true }).check({ force: true });
    await page.getByRole("combobox", { name: "District" }).fill("Sylhet");
    await page.keyboard.press("Enter");
    await page.getByRole("button", { name: "Register as donor" }).click();
    await expect(page.getByText(/You're registered as a donor/)).toBeVisible();

    await page.goto("/account");
    await expect(page.getByText("Sylhet").first()).toBeVisible();
  });

  test("patient posts a blood request for review", async ({ page, signIn }) => {
    await signIn(IDS.patient);
    await page.goto("/request/new");
    await page.locator("label").filter({ hasText: /^O\+$/ }).click();
    await page.getByLabel("Hospital / institute name").fill("Khulna Medical College Hospital");
    await page.getByRole("combobox", { name: "District" }).fill("Khulna");
    await page.keyboard.press("Enter");
    await page.getByLabel("Required date").fill(isoDate(2));
    await page.getByLabel("Contact phone").fill("01812345678");
    await page.getByRole("button", { name: "Submit request" }).click();
    await expect(page.getByRole("heading", { name: /Request submitted/ })).toBeVisible();

    // The submitted request is private (pending) but listed on the owner's account page.
    await page.goto("/account");
    await expect(page.getByText("Khulna Medical College Hospital")).toBeVisible();
    await expect(page.getByText(/Khulna/).first()).toBeVisible();
    await expect(page.getByText("Bagerhat")).toHaveCount(0);
  });

  test("validation errors are shown inline", async ({ page, signIn }) => {
    await signIn(IDS.patient);
    await page.goto("/request/new");
    await page.getByRole("button", { name: "Submit request" }).click();
    await expect(page.getByText("Select a blood group")).toBeVisible();
    await expect(page.getByText("Enter the hospital or institute name")).toBeVisible();
  });

  test("donor comments, replies and reveals the contact number", async ({ page, signIn }) => {
    await signIn(IDS.donor);
    await page.goto(dhaka);

    await page.getByLabel("Write a comment").fill("I am B+ and can come to the hospital this evening.");
    await page.getByRole("button", { name: "Post comment" }).click();
    await expect(page.getByText("I am B+ and can come to the hospital this evening.")).toBeVisible();

    await page
      .getByRole("button", { name: /^Reply/ })
      .first()
      .click();
    await page.getByLabel("Write a reply").fill("Calling the family now.");
    await page.getByRole("button", { name: "Reply", exact: true }).last().click();
    await expect(page.getByText("Calling the family now.")).toBeVisible();

    await page.getByRole("button", { name: "Show number" }).click();
    await expect(page.getByRole("link", { name: /01712345678/ })).toBeVisible();
  });

  test("guests cannot reach the account page", async ({ page }) => {
    await page.goto("/account");
    await expect(page).toHaveURL(/\/login\?callbackUrl=%2Faccount/);
  });
});
