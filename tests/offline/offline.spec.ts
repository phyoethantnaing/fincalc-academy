import { test, expect } from "@playwright/test";
test("production PWA precaches lessons, fonts and charts then computes offline after reload", async ({
  page,
  context,
}) => {
  await page.goto(process.env.PLAYWRIGHT_BASE_PATH || "/");
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await expect
    .poll(() => page.evaluate(() => !!navigator.serviceWorker.controller))
    .toBe(true);
  await context.setOffline(true);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Financial calculator." }),
  ).toBeVisible();
  for (const k of ["2", "ENTER", "3", "+"])
    await page.getByLabel(`Key ${k}`, { exact: true }).click();
  await expect(page.getByLabel("Calculator display")).toHaveText("5.00");
  await page.getByRole("button", { name: "အတူတူ လေ့လာကြမယ်" }).click();
  await expect(
    page
      .getByRole("heading", { name: "ချေးငွေပြန်ဆပ်နည်း", exact: true })
      .first(),
  ).toBeVisible();
  await page.getByLabel("Animation speed").selectOption("250");
  await page.getByLabel("Play tutorial", { exact: true }).click();
  await expect(page.getByLabel("Calculator display")).toHaveText("-8,884.88", {
    timeout: 15000,
  });
  await expect(page.locator(".recharts-surface").first()).toBeVisible();
});
