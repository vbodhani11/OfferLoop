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

  test("rejecting requires a reason, then advances and shows a receipt", async ({
    page,
  }) => {
    const session = page.getByTestId("session-feedback-bar");
    await expect(session).toContainText("Rejected: 0");

    const firstName = await page.getByTestId("candidate-card").locator("h3").innerText();

    await page.getByRole("button", { name: /^Reject /i }).click();
    const dialog = page.getByTestId("reject-reason-dialog");
    await expect(dialog).toBeVisible();
    await expect(
      dialog.getByRole("heading", {
        name: "Why are you rejecting this fictional candidate?",
      }),
    ).toBeVisible();

    // Confirm stays disabled until a reason is chosen.
    await expect(
      dialog.getByRole("button", { name: "Confirm rejection" }),
    ).toBeDisabled();

    await dialog.getByRole("radio", { name: "Skills do not match" }).click();
    await dialog
      .getByLabel("Optional fictional hiring note")
      .fill("Looking for deeper backend experience.");
    await dialog.getByRole("button", { name: "Confirm rejection" }).click();

    await expect(session).toContainText("Rejected: 1");
    await expect(page.getByText("1 fictional decision made this session")).toBeVisible();

    const receipt = page.getByTestId("decision-receipt");
    await expect(receipt).toBeVisible();
    await expect(receipt).toContainText(firstName);
    await expect(receipt).toContainText("Skills do not match");
    await expect(receipt).toContainText("Looking for deeper backend experience.");
    await expect(receipt).toContainText("No real person was affected.");

    // No protected-characteristic reasons in the dialog catalog.
    await page.getByRole("button", { name: /^Reject /i }).click();
    const nextDialog = page.getByTestId("reject-reason-dialog");
    await expect(nextDialog).toBeVisible();
    const reasonText = await nextDialog.innerText();
    expect(reasonText.toLowerCase()).not.toMatch(
      /age|gender|race|ethnicity|religion|disability|appearance/,
    );
    await nextDialog.getByRole("button", { name: "Cancel" }).click();
  });

  test("cancel keeps the candidate and does not increment the counter", async ({
    page,
  }) => {
    const session = page.getByTestId("session-feedback-bar");
    const firstName = await page.getByTestId("candidate-card").locator("h3").innerText();

    await page.getByRole("button", { name: /^Reject /i }).click();
    await page
      .getByTestId("reject-reason-dialog")
      .getByRole("button", { name: "Cancel" })
      .click();
    await expect(page.getByTestId("reject-reason-dialog")).toBeHidden();
    await expect(session).toContainText("Rejected: 0");
    await expect(page.getByRole("heading", { name: firstName })).toBeVisible();
  });

  test("undo returns the rejected candidate and decrements the counter", async ({
    page,
  }) => {
    const session = page.getByTestId("session-feedback-bar");
    const firstName = await page.getByTestId("candidate-card").locator("h3").innerText();

    await page.getByRole("button", { name: /^Reject /i }).click();
    const dialog = page.getByTestId("reject-reason-dialog");
    await dialog.getByRole("radio", { name: "Role is not the right fit" }).click();
    await dialog.getByRole("button", { name: "Confirm rejection" }).click();
    await expect(session).toContainText("Rejected: 1");

    await page.getByRole("button", { name: "Undo" }).first().click();
    await expect(session).toContainText("Rejected: 0");
    await expect(page.getByRole("heading", { name: firstName })).toBeVisible();
  });

  test("shortlisting a candidate increments the shortlist counter", async ({ page }) => {
    await page.getByRole("button", { name: /^Shortlist /i }).click();
    await expect(page.getByTestId("session-feedback-bar")).toContainText(
      "Shortlisted: 1",
    );
  });

  test("sending a simulated offer increments the offer counter and confirms no real person was contacted", async ({
    page,
  }) => {
    await page.getByRole("button", { name: /^Send simulated offer to /i }).click();
    await expect(page.getByTestId("session-feedback-bar")).toContainText(
      "Simulated offers: 1",
    );
    await expect(
      page.getByText("Simulated offer created. No real person was contacted.").first(),
    ).toBeVisible();
  });

  test("resetting the deck brings previously rejected candidates back", async ({
    page,
  }) => {
    const session = page.getByTestId("session-feedback-bar");

    async function rejectOnce() {
      await page.getByRole("button", { name: /^Reject /i }).click();
      const dialog = page.getByTestId("reject-reason-dialog");
      await dialog.getByRole("radio", { name: "Skills do not match" }).click();
      await dialog.getByRole("button", { name: "Confirm rejection" }).click();
      await expect(dialog).toBeHidden();
    }

    await rejectOnce();
    await expect(session).toContainText("Rejected: 1");
    await rejectOnce();
    await expect(session).toContainText("Rejected: 2");

    await page.getByRole("button", { name: "Reset deck" }).click();
    await expect(session).toContainText("Rejected: 0");
    await expect(
      page.getByText("Deck reset. All fictional candidates are back.").first(),
    ).toBeVisible();
  });

  test("keyboard Left opens the rejection dialog; Right and Up still decide", async ({
    page,
  }) => {
    const session = page.getByTestId("session-feedback-bar");
    await page.locator("body").click();
    await page.keyboard.press("ArrowLeft");
    await expect(page.getByTestId("reject-reason-dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByTestId("reject-reason-dialog")).toBeHidden();
    await expect(session).toContainText("Rejected: 0");

    await page.keyboard.press("ArrowRight");
    await expect(session).toContainText("Shortlisted: 1");

    await page.keyboard.press("ArrowUp");
    await expect(session).toContainText("Simulated offers: 1");

    await page.keyboard.press("z");
    await expect(session).toContainText("Simulated offers: 0");
  });

  test("the keyboard-help dialog lists all shortcuts", async ({ page }) => {
    await page.getByRole("button", { name: "Keyboard shortcuts" }).click();
    const dialog = page.getByRole("dialog", { name: "Keyboard shortcuts" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("Open rejection reason dialog")).toBeVisible();
    await expect(dialog.getByText("Shortlist")).toBeVisible();
    await expect(dialog.getByText("Send simulated offer")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
  });

  test("candidate card fits content without an oversized blank body", async ({
    page,
  }) => {
    const card = page.getByTestId("candidate-card");
    await expect(card).toBeVisible();
    const box = await card.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeGreaterThan(280);
    expect(box!.height).toBeLessThan(620);
    const viewport = page.getByTestId("candidate-deck-viewport");
    const viewportBox = await viewport.boundingBox();
    expect(viewportBox).not.toBeNull();
    expect(viewportBox!.height - box!.height).toBeLessThan(48);
  });
});
