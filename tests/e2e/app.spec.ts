import { test, expect } from "@playwright/test";
test("student learns a loan, practices, passes the quiz, and retains progress", async ({
  page,
}) => {
  await page.goto("/");
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
  await expect(
    page.getByRole("heading", { name: "ငွေပြန်ဆပ်မည့် အစီအစဉ်" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Practice", exact: true }).click();
  await page.getByTestId("practice-answer").fill("17769.76");
  await page.getByRole("button", { name: "အဖြေစစ်မယ်" }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "Correct" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Quiz", exact: true }).click();
  await page.locator(".quiz-options button").nth(1).click();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          JSON.parse(localStorage.getItem("fincalc.progress") || "{}")["2"]
            ?.completed,
      ),
    )
    .toBe(true);
  await page.reload();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          JSON.parse(localStorage.getItem("fincalc.progress") || "{}")["2"]
            ?.completed,
      ),
    )
    .toBe(true);
});
test("keypad, stack, language, exports, save/load and mobile layout", async ({
  page,
}) => {
  await page.goto("/");
  for (const k of ["2", "ENTER", "3", "+"])
    await page.getByLabel(`Key ${k}`, { exact: true }).click();
  await expect(page.getByLabel("Calculator display")).toHaveText("5.00");
  await page
    .getByRole("button", { name: "Save calculation", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Saved Calculations", exact: true })
    .click();
  await expect(page.getByRole("button", { name: "Load" })).toBeVisible();
  await page.getByRole("button", { name: "Load" }).click();
  await expect(page.getByLabel("Calculator display")).toHaveText("5.00");
  await page.getByRole("button", { name: "မြန်မာ", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "English", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Start learning together" }).click();
  const downloadPromise = page.waitForEvent("download");
  await page.getByTitle("Export CSV", { exact: true }).click();
  expect((await downloadPromise).suggestedFilename()).toBe(
    "fincalc-amortization.csv",
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await expect
    .poll(() =>
      page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    )
    .toBe(true);
  await expect(page.getByLabel("Key ENTER", { exact: true })).toBeVisible();
});
test("manual practice guides real presses and next/previous replay the engine", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "အတူတူ လေ့လာကြမယ်" }).click();
  await page.getByRole("button", { name: "ကိုယ်တိုင် ခလုတ်နှိပ်မယ်" }).click();
  await page.getByLabel("Key 2", { exact: true }).click();
  await expect(page.getByText("Try f next.", { exact: false })).toBeVisible();
  await page.getByLabel("Key f", { exact: true }).click();
  await page.getByLabel("Key x↔y", { exact: true }).click();
  await expect(page.getByLabel("Calculator display")).toHaveText("0.00");
  await page.getByLabel("Replay tutorial").click();
  await page.getByLabel("Next step").click();
  await expect(page.locator(".lcd-status")).toContainText("f");
  await page.getByLabel("Previous step").click();
  await expect(page.locator(".lcd-status")).toContainText("RPN");
});
test("beginner loan and comparison update from actual inputs", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "လွယ်ကူစွာတွက်ချက်မယ်", exact: true })
    .click();
  await page.getByRole("button", { name: "တွက်ချက်မယ်", exact: true }).click();
  await expect(page.locator(".tool-result h2")).toHaveText("8,884.88");
  await page
    .getByRole("button", { name: "Show on the RPN calculator" })
    .click();
  await expect(page.getByLabel("Calculator display")).toHaveText("-8,884.88");
  await page
    .getByRole("button", { name: "Compare Offers", exact: true })
    .click();
  await expect(page.getByText("12.68%", { exact: true }).first()).toBeVisible();
});
test("all physical keys respond and unsupported functions give an explicit notice", async ({
  page,
}) => {
  await page.goto("/");
  const keys = await page
    .locator(".calc-key")
    .evaluateAll((es) =>
      es.map((e) => e.getAttribute("aria-label")!.replace("Key ", "")),
    );
  for (const key of keys) {
    await page.getByTitle("Reset calculator", { exact: true }).click();
    await page.getByLabel(`Key ${key}`, { exact: true }).click();
    if (["R/S", "SST", "Σ+"].includes(key))
      await expect(page.getByRole("alert")).toContainText("not implemented");
    else if (key === "ON")
      await expect(page.getByLabel("Calculator display")).toHaveText("");
    else await expect(page.getByLabel("Calculator display")).toBeVisible();
  }
});
test("responsive views never overflow and expanded touch keys have large targets", async ({
  page,
}) => {
  await page.goto("/");
  for (const width of [320, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await expect
      .poll(() =>
        page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      )
      .toBe(true);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Larger touch keys" }).click();
  const box = await page.getByLabel("Key 7", { exact: true }).boundingBox();
  expect(box!.width).toBeGreaterThanOrEqual(44);
  expect(box!.height).toBeGreaterThanOrEqual(44);
  await page.getByTitle("Toggle menu").click();
  await page
    .getByRole("button", { name: "Compare Offers", exact: true })
    .click();
  await expect
    .poll(() =>
      page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    )
    .toBe(true);
});
