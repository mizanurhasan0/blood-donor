import { expect, IDS, test } from "./fixtures";

const dhaka = `/requests/${IDS.requestDhaka.toHexString()}`;

test.describe("request listing", () => {
  test("shows published requests only", async ({ page }) => {
    await page.goto("/requests");
    await expect(page.getByText("Dhaka Medical College Hospital")).toBeVisible();
    await expect(page.getByText("Chattogram Medical College")).toBeVisible();
    await expect(page.getByText("Sylhet MAG Osmani Medical College")).toHaveCount(0);
  });

  test("filters by blood group through the URL and clears", async ({ page }) => {
    await page.goto("/requests");
    await page.getByRole("button", { name: "O-", exact: true }).click();
    await expect(page).toHaveURL(/bloodGroup=O-/);
    await expect(page.getByText("Chattogram Medical College")).toBeVisible();
    await expect(page.getByText("Dhaka Medical College Hospital")).toHaveCount(0);

    await page
      .getByRole("button", { name: /Clear filters/ })
      .first()
      .click();
    await expect(page).toHaveURL(/\/requests$/);
    await expect(page.getByText("Dhaka Medical College Hospital")).toBeVisible();
  });

  test("searches by hospital or district", async ({ page }) => {
    await page.goto("/requests");
    await page.getByRole("searchbox", { name: /Search by hospital or district/ }).fill("Chattogram");
    await expect(page).toHaveURL(/q=Chattogram/);
    await expect(page.getByText("Dhaka Medical College Hospital")).toHaveCount(0);
    await expect(page.getByText("Chattogram Medical College")).toBeVisible();
  });

  test("direct filter URLs are server-rendered", async ({ page }) => {
    await page.goto("/requests?bloodGroup=B%2B&district=dhaka");
    await expect(page.getByText("Dhaka Medical College Hospital")).toBeVisible();
    await expect(page.getByText("Chattogram Medical College")).toHaveCount(0);
  });
});

test.describe("request detail", () => {
  test("shows details without exposing the phone number", async ({ page }) => {
    await page.goto(dhaka);
    await expect(page).toHaveTitle(/B\+/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByText("017•••••678").first()).toBeVisible();
    expect(await page.content()).not.toContain("01712345678");
    await expect(page.getByText("Sign in to join the conversation")).toBeVisible();
  });

  // The root layout streams before the page resolves, so Next.js serves not-found
  // UI with a noindex tag rather than a 404 status once streaming has started.
  test("unknown and pending requests are not shown to the public", async ({ page }) => {
    await page.goto("/requests/64c0000000000000000000ff");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/not found|couldn't find/i);
    await expect(page.locator('meta[name="robots"][content*="noindex"]').first()).toBeAttached();

    await page.goto(`/requests/${IDS.requestPending.toHexString()}`);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/not found|couldn't find/i);
    await expect(page.getByText("Sylhet MAG Osmani Medical College")).toHaveCount(0);
  });
});
