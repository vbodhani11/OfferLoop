import { expect, test } from "@playwright/test";

test.describe("Error handling", () => {
  test("an invalid job route shows the not-found state", async ({ page }) => {
    await page.goto("/accept/jobs/this-job-does-not-exist");
    await expect(
      page.getByRole("heading", { name: "This page doesn't exist in the simulation" }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Back to homepage" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Browse fictional jobs" })).toBeVisible();
  });

  test("an invalid candidate route shows the not-found state", async ({ page }) => {
    await page.goto("/reject/candidates/this-candidate-does-not-exist");
    await expect(
      page.getByRole("heading", { name: "This page doesn't exist in the simulation" }),
    ).toBeVisible();
  });

  test("an arbitrary unknown route falls back to the global not-found page", async ({
    page,
  }) => {
    await page.goto("/this-route-does-not-exist");
    await expect(
      page.getByRole("heading", { name: "This page doesn't exist in the simulation" }),
    ).toBeVisible();
    await page.getByRole("link", { name: "Back to homepage" }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test("the offline fallback page communicates that guest data remains available on-device", async ({
    page,
  }) => {
    await page.goto("/offline");
    await expect(page.getByRole("heading", { name: "You're offline" })).toBeVisible();
    await expect(
      page.getByText(
        /Marketing pages and guest data you've already loaded remain available/,
      ),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Try the homepage" })).toBeVisible();
  });

  test("missing Supabase environment variables activate guest demo mode instead of crashing", async ({
    page,
  }) => {
    // In local/dev without Supabase configured, sign-in explains the
    // limitation instead of throwing, and the rest of the app keeps working
    // fully in guest mode.
    await page.goto("/sign-in");
    await expect(
      page.getByRole("heading", { name: "Sign in to OfferLoop" }),
    ).toBeVisible();

    await page.goto("/accept");
    await expect(
      page.getByRole("heading", { name: "Browse fictional jobs" }),
    ).toBeVisible();
    await expect(page.locator("article").first()).toBeVisible();
  });

  test("localStorage corruption does not crash the Saved Jobs page", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      window.localStorage.setItem(
        "offerloop_guest_saved_jobs_v1",
        "{not valid json at all",
      );
    });
    await page.goto("/saved");
    await expect(
      page.getByRole("heading", { name: "Saved fictional jobs" }),
    ).toBeVisible();
    // Corrupt data is safely discarded, so the page renders its empty state
    // rather than crashing or showing an error boundary.
    await expect(page.getByText("No saved jobs yet")).toBeVisible();
  });

  test("double-clicking Apply does not create duplicate offers", async ({ page }) => {
    await page.goto("/accept");
    const applyLink = page
      .locator("article")
      .first()
      .getByRole("link", { name: "Apply" });
    // A real double-click dispatches both click events as a single Playwright
    // action after one actionability check, modeling an actual rapid double
    // click without racing two independent actions against an element that
    // gets detached mid-navigation.
    await applyLink.click({ clickCount: 2 });
    await expect(page).toHaveURL(/\/accept\/review\//);
    await page.getByRole("button", { name: "Skip animation" }).click();
    await expect(page.getByText("Career Simulation — Not a Real Job Offer")).toBeVisible({
      timeout: 15_000,
    });

    await page.goto("/offers");
    const offerCards = page.getByRole("main").getByText("Simulated", { exact: true });
    await expect(offerCards).toHaveCount(1);
  });

  test("the browser back button returns cleanly from the review flow to the job feed", async ({
    page,
  }) => {
    await page.goto("/accept");
    await page.locator("article").first().getByRole("link", { name: "Apply" }).click();
    await expect(page).toHaveURL(/\/accept\/review\//);
    await page.goBack();
    await expect(
      page.getByRole("heading", { name: "Browse fictional jobs" }),
    ).toBeVisible();
  });
});
