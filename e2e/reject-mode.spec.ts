import { expect, test } from "@playwright/test";

test.describe("Reject Mode", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/reject");
    await expect(
      page.getByRole("heading", { name: "Step into Recruiter Mode" }),
    ).toBeVisible();
  });

  test("shows the fictional-candidate disclosure", async ({ page }) => {
    await expect(
      page.getByText(
        "Every profile in this mode is fictional. No real person receives these decisions.",
      ),
    ).toBeVisible();
  });

  test("rejecting a candidate removes the card and increments the reject counter", async ({
    page,
  }) => {
    await expect(page.getByText("Rejected: 0")).toBeVisible();
    await page.getByRole("button", { name: /^Reject /i }).click();
    await expect(page.getByText("Rejected: 1")).toBeVisible();
    await expect(page.getByText("1 fictional decision made this session")).toBeVisible();
  });

  test("undo returns the rejected candidate and decrements the counter", async ({
    page,
  }) => {
    await page.getByRole("button", { name: /^Reject /i }).click();
    await expect(page.getByText("Rejected: 1")).toBeVisible();

    await page.getByRole("button", { name: "Undo" }).click();
    await expect(page.getByText("Rejected: 0")).toBeVisible();
    await expect(page.getByText("0 fictional decisions made this session")).toBeVisible();
  });

  test("shortlisting a candidate increments the shortlist counter", async ({ page }) => {
    await page.getByRole("button", { name: /^Shortlist /i }).click();
    await expect(page.getByText("Shortlisted: 1")).toBeVisible();
  });

  test("sending a simulated offer increments the offer counter and confirms no real person was contacted", async ({
    page,
  }) => {
    await page.getByRole("button", { name: /^Send simulated offer to /i }).click();
    await expect(page.getByText("Simulated offers: 1")).toBeVisible();
    await expect(
      page.getByText("Simulated offer created. No real person was contacted.").first(),
    ).toBeVisible();
  });

  test("resetting the deck brings previously rejected candidates back", async ({
    page,
  }) => {
    await page.getByRole("button", { name: /^Reject /i }).click();
    await page.getByRole("button", { name: /^Reject /i }).click();
    await expect(page.getByText("Rejected: 2")).toBeVisible();

    await page.getByRole("button", { name: "Reset deck" }).click();
    await expect(page.getByText("Rejected: 0")).toBeVisible();
    await expect(
      page.getByText("Deck reset. All fictional candidates are back.").first(),
    ).toBeVisible();
  });

  test("keyboard shortcuts drive reject, shortlist, and offer decisions", async ({
    page,
  }) => {
    await page.locator("body").click();
    await page.keyboard.press("ArrowLeft");
    await expect(page.getByText("Rejected: 1")).toBeVisible();

    await page.keyboard.press("ArrowRight");
    await expect(page.getByText("Shortlisted: 1")).toBeVisible();

    await page.keyboard.press("ArrowUp");
    await expect(page.getByText("Simulated offers: 1")).toBeVisible();

    await page.keyboard.press("z");
    await expect(page.getByText("Simulated offers: 0")).toBeVisible();
  });

  test("the keyboard-help dialog lists all shortcuts", async ({ page }) => {
    await page.getByRole("button", { name: "Keyboard shortcuts" }).click();
    const dialog = page.getByRole("dialog", { name: "Keyboard shortcuts" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("Reject")).toBeVisible();
    await expect(dialog.getByText("Shortlist")).toBeVisible();
    await expect(dialog.getByText("Send simulated offer")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
  });
});
