import AxeBuilder from "@axe-core/playwright";
import { expect, IDS, test } from "./fixtures";

const PAGES = [
  "/",
  "/requests",
  `/requests/${IDS.requestDhaka.toHexString()}`,
  "/how-it-works",
  "/login",
  "/privacy",
];

for (const path of PAGES) {
  test(`no serious accessibility violations on ${path}`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
    const serious = violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
  });
}
