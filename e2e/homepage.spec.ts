import { expect, test } from "@playwright/test";

test.describe("Homepage", () => {
  test("loads with the hero headline and primary mode CTAs", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "Turn job-search stress into a fictional win." }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Enter Accept Mode/ }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Enter Reject Mode/ }).first(),
    ).toBeVisible();
  });

  test("shows the entertainment-simulation disclosure", async ({ page }) => {
    await page.goto("/");
    await expect(
      page
        .getByText("Entertainment simulation. No real jobs or candidates are involved.")
        .first(),
    ).toBeVisible();
  });

  test("Enter Accept Mode navigates to /accept", async ({ page }) => {
    await page.goto("/");
    await page
      .getByRole("link", { name: /Enter Accept Mode/ })
      .first()
      .click();
    await expect(page).toHaveURL(/\/accept$/);
    await expect(
      page.getByRole("heading", { name: "Browse fictional jobs" }),
    ).toBeVisible();
  });

  test("Enter Reject Mode navigates to /reject", async ({ page }) => {
    await page.goto("/");
    await page
      .getByRole("link", { name: /Enter Reject Mode/ })
      .first()
      .click();
    await expect(page).toHaveURL(/\/reject$/);
    await expect(
      page.getByRole("heading", { name: "Step into Recruiter Mode" }),
    ).toBeVisible();
  });

  test("theme toggle switches between light and dark", async ({ page }) => {
    await page.goto("/");
    const toggle = page.getByRole("button", { name: /Switch to (dark|light) theme/ });
    await expect(toggle).toBeVisible();
    const initialLabel = await toggle.getAttribute("aria-label");
    await toggle.click();
    await expect(
      page.getByRole("button", { name: /Switch to (dark|light) theme/ }),
    ).not.toHaveAttribute("aria-label", initialLabel ?? "");
  });

  test("mobile navigation menu opens and links to Accept Mode", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.getByRole("button", { name: "Open menu" }).click();
    const nav = page.getByRole("navigation", { name: "Mobile" });
    await expect(nav.getByRole("link", { name: "Accept Mode" })).toBeVisible();
    await nav.getByRole("link", { name: "Accept Mode" }).click();
    await expect(page).toHaveURL(/\/accept$/);
  });
});
