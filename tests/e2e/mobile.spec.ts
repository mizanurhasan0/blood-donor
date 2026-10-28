import { expect, test } from "./fixtures";

const PAGES = ["/", "/requests", "/how-it-works", "/become-donor", "/login"];

test.describe("mobile", () => {
  test("menu opens, navigates and closes", async ({ page }) => {
    await page.goto("/");
    const toggle = page.getByRole("button", { name: "Open menu" });
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await toggle.click();
    const menu = page.getByRole("navigation", { name: "Mobile" });
    await expect(menu).toBeVisible();
    await menu.getByRole("link", { name: "How It Works" }).click();
    await expect(page).toHaveURL(/\/how-it-works$/);
    await expect(menu).toBeHidden();
  });

  test("menu closes with Escape", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Open menu" }).click();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("navigation", { name: "Mobile" })).toBeHidden();
  });

  for (const width of [320, 375]) {
    test(`no horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      for (const path of PAGES) {
        await page.goto(path);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        expect(overflow, `${path} overflows by ${overflow}px`).toBeLessThanOrEqual(0);
      }
    });
  }
});
