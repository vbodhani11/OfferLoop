import { expect, test } from "@playwright/test";

test.describe("Accept Mode", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/accept");
    await expect(
      page.getByRole("heading", { name: "Browse fictional jobs" }),
    ).toBeVisible();
  });

  test("searches for a job by title", async ({ page }) => {
    const searchBox = page.getByRole("searchbox", { name: "Search fictional jobs" });
    await searchBox.fill("Engineer");
    await expect(page.getByRole("status")).toContainText("fictional jobs", {
      timeout: 10_000,
    });
    const cardCount = await page.locator("article").count();
    expect(cardCount).toBeGreaterThan(0);
  });

  test("filters jobs by category via the sidebar filters", async ({ page }) => {
    await page.getByRole("combobox", { name: "Filter by category" }).click();
    await page.getByRole("option", { name: "Civil Engineering" }).click();
    await expect(page.getByRole("status")).toContainText("fictional jobs", {
      timeout: 10_000,
    });
    await expect(page.locator("article").first()).toBeVisible();
  });

  test("views job details from the feed", async ({ page }) => {
    const firstCard = page.locator("article").first();
    const title = await firstCard.getByRole("heading").first().innerText();
    await firstCard.getByRole("link", { name: "View details" }).click();
    await expect(
      page.getByRole("heading", { name: title, exact: true, level: 1 }),
    ).toBeVisible();
    await expect(
      page.getByText("This opportunity exists only inside the OfferLoop simulation."),
    ).toBeVisible();
  });

  test("saves a job from the feed and it appears on the Saved Jobs page", async ({
    page,
  }) => {
    const firstCard = page.locator("article").first();
    const title = await firstCard.getByRole("heading").first().innerText();
    await firstCard.getByRole("button", { name: "Save this fictional job" }).click();
    await expect(
      firstCard.getByRole("button", { name: "Remove from saved jobs" }),
    ).toBeVisible();

    await page.getByRole("link", { name: /Saved \(/ }).click();
    await expect(page).toHaveURL(/\/saved$/);
    await expect(page.getByText(title)).toBeVisible();
  });

  test("applying runs the review animation and produces a fictional offer with a simulation watermark", async ({
    page,
  }) => {
    const firstCard = page.locator("article").first();
    const title = await firstCard.getByRole("heading").first().innerText();
    await firstCard.getByRole("link", { name: "Apply" }).click();

    await expect(page).toHaveURL(/\/accept\/review\//);
    await expect(page.getByText("Simulation in progress")).toBeVisible();

    await page.getByRole("button", { name: "Skip animation" }).click();

    await expect(page.getByText("Career Simulation — Not a Real Job Offer")).toBeVisible({
      timeout: 15_000,
    });
    await expect(
      page.getByRole("heading", { name: title, exact: true, level: 2 }),
    ).toBeVisible();
    await expect(
      page.getByText(
        "This is an entertainment experience. It is not a real employment offer and has no legal or financial value.",
      ),
    ).toBeVisible();
  });

  test("a saved offer persists after a full page refresh (guest persistence)", async ({
    page,
  }) => {
    const firstCard = page.locator("article").first();
    const title = await firstCard.getByRole("heading").first().innerText();
    await firstCard.getByRole("link", { name: "Apply" }).click();
    await page.getByRole("button", { name: "Skip animation" }).click();
    await expect(page.getByText("Career Simulation — Not a Real Job Offer")).toBeVisible({
      timeout: 15_000,
    });

    await page.reload();
    await expect(
      page.getByRole("heading", { name: title, exact: true, level: 2 }),
    ).toBeVisible({ timeout: 15_000 });

    await page.goto("/offers");
    await expect(page.getByText(title)).toBeVisible();
  });

  test("applying to the same job twice reopens the existing offer instead of duplicating it", async ({
    page,
  }) => {
    const firstCard = page.locator("article").first();
    await firstCard.getByRole("link", { name: "Apply" }).click();
    await page.getByRole("button", { name: "Skip animation" }).click();
    await expect(page.getByText("Career Simulation — Not a Real Job Offer")).toBeVisible({
      timeout: 15_000,
    });

    await page.goBack();
    await expect(
      page.getByRole("heading", { name: "Browse fictional jobs" }),
    ).toBeVisible();

    const sameCard = page.locator("article").first();
    await sameCard.getByRole("link", { name: "Apply" }).click();
    // Duplicate application: the offer should reopen immediately without
    // replaying the multi-stage review animation.
    await expect(page.getByText("Career Simulation — Not a Real Job Offer")).toBeVisible({
      timeout: 15_000,
    });

    await page.goto("/offers");
    const offerCards = page.getByRole("main").getByText("Simulated", { exact: true });
    await expect(offerCards).toHaveCount(1);
  });
});
