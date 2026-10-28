import { expect, test } from "./fixtures";

test.describe("homepage", () => {
  test("renders hero, real stats and recent requests", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle("BloodLink | Blood Donation Community Bangladesh");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("United for");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Bangladesh");

    const stats = page.getByRole("region", { name: "Community statistics" });
    await expect(stats.getByText("Registered Donors")).toBeVisible();
    // Seeded data: 1 donor, 2 published requests — the page must show the real counts.
    await expect(stats).toContainText("1Registered Donors");
    await expect(stats).toContainText("2Active Requests");

    await expect(page.getByRole("heading", { name: "Recent Blood Requests" })).toBeVisible();
    await expect(page.getByRole("link", { name: /2 Units Needed/ }).first()).toBeVisible();
    // Pending requests are never public.
    await expect(page.getByText("Sylhet MAG Osmani")).toHaveCount(0);
  });

  test("primary navigation works", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Main" });
    await nav.getByRole("link", { name: "Blood Requests" }).click();
    await expect(page).toHaveURL(/\/requests$/);
    await expect(page.getByRole("heading", { level: 1, name: "Blood Requests" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Blood Requests" })).toHaveAttribute("aria-current", "page");
  });

  test("guests are asked to sign in before posting a request", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Post Blood Request" }).first().click();
    await expect(page).toHaveURL(/\/request\/new$/);
    await expect(page.getByRole("button", { name: /Continue with Google/ })).toBeVisible();
  });
});
