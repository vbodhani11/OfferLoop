import { expect, test } from "@playwright/test";

test.describe("Accessibility", () => {
  test("the homepage has a keyboard-focusable skip-to-content link targeting the main region", async ({
    page,
  }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skipLink = page.getByRole("link", { name: /skip to content/i });
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toHaveAttribute("href", "#main-content");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#main-content$/);
  });

  test("Accept Mode's primary apply flow works without a mouse", async ({ page }) => {
    await page.goto("/accept");
    const applyLink = page
      .locator("article")
      .first()
      .getByRole("link", { name: "Apply" });
    await applyLink.focus();
    await expect(applyLink).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/accept\/review\//);

    const skipButton = page.getByRole("button", { name: "Skip animation" });
    await skipButton.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByText("Career Simulation — Not a Real Job Offer")).toBeVisible({
      timeout: 15_000,
    });
  });

  test("Reject Mode's swipe actions have keyboard-accessible button equivalents", async ({
    page,
  }) => {
    await page.goto("/reject");
    await expect(page.getByRole("button", { name: /^Reject /i })).toBeVisible();
    await expect(page.getByRole("button", { name: /^Shortlist /i })).toBeVisible();
    await expect(
      page.getByRole("button", { name: /^Send simulated offer to /i }),
    ).toBeVisible();
  });

  test("the keyboard-shortcuts dialog traps focus and closes on Escape, restoring focus", async ({
    page,
  }) => {
    await page.goto("/reject");
    const helpButton = page.getByRole("button", { name: "Keyboard shortcuts" });
    await helpButton.click();

    const dialog = page.getByRole("dialog", { name: "Keyboard shortcuts" });
    await expect(dialog).toBeVisible();

    // Tabbing repeatedly should keep focus inside the dialog.
    for (let i = 0; i < 8; i += 1) {
      await page.keyboard.press("Tab");
      await expect(dialog.locator(":focus")).toHaveCount(1);
    }

    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
    await expect(helpButton).toBeFocused();
  });

  test("interactive elements show a visible focus outline", async ({ page }) => {
    await page.goto("/");
    const ctaLink = page.getByRole("link", { name: /Enter Accept Mode/ }).first();
    await ctaLink.focus();
    const outline = await ctaLink.evaluate((el) => getComputedStyle(el).outlineStyle);
    // The design system applies a visible focus ring via `:focus-visible`; at
    // minimum the element must not opt out of all focus indication.
    expect(outline).not.toBe("none");
  });

  test("reduced-motion preference is respected end-to-end for the offer celebration", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/accept");
    await page.locator("article").first().getByRole("link", { name: "Apply" }).click();
    await expect(page.getByText("Simulation in progress")).toBeVisible();
    // With reduced motion, stages advance immediately without waiting for
    // the full animated duration.
    await expect(page.getByText("Career Simulation — Not a Real Job Offer")).toBeVisible({
      timeout: 10_000,
    });
  });

  test("job and candidate pages announce simulation disclosures accessible to screen readers", async ({
    page,
  }) => {
    await page.goto("/accept");
    await page
      .locator("article")
      .first()
      .getByRole("link", { name: "View details" })
      .click();
    await expect(page.getByRole("note")).toContainText(/fictional|simulation/i);

    await page.goto("/reject");
    await expect(page.getByText("Every profile in this mode is fictional")).toBeVisible();
  });
});
