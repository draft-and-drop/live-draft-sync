import { test, expect } from "@playwright/test";

test.describe("Sleeper page tests", () => {
  test("Sleeper DOM has the expected elements", async ({ page }) => {
    await page.goto(`https://sleeper.com/draft/nfl/1378612603567226880`, {
      waitUntil: "domcontentloaded",
    });

    await expect(page.locator(".column-container")).toBeVisible();

    await expect(page.locator(".team-column")).toHaveCount(10);

    const teamCells = page.locator(".cell-container");
    await expect(teamCells).toHaveCount(10 * 15);

    const cell = teamCells.nth(0);
    await expect(cell.locator("div[id^='draft-cell-']")).toHaveCount(1);
    await expect(cell.locator(".pick")).toHaveCount(1);

    const player = cell.locator(".player");
    await expect(player).toHaveCount(1);
    await expect(player.locator(".player-name")).toHaveText("J. Gibbs");
    await expect(player.locator(".position")).toHaveText("RB - DET");
  });
});
