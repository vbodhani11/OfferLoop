import { expect, test } from "@playwright/test";

test.describe("Milestone celebrations", () => {
  test("five rejection milestone appears once and does not reappear after refresh", async ({
    page,
  }) => {
    await page.goto("/reject");
    await expect(
      page.getByRole("heading", { name: "Step into Recruiter Mode" }),
    ).toBeVisible();

    // Seed lifetime progress so the next rejection crosses the 5 threshold
    // without replaying the first-decision celebration.
    await page.evaluate(() => {
      const lifetime = {
        version: 1,
        counts: {
          applications: 0,
          rejections: 4,
          shortlists: 0,
          offers_sent: 0,
          offers_received: 0,
          saved_jobs: 0,
        },
        unlockedAchievements: [
          {
            achievementCode: "first_rejection",
            unlockedAt: "2026-01-01T00:00:00.000Z",
            progressAtUnlock: 1,
            category: "rejections",
            version: 1,
          },
        ],
        displayedMilestones: [
          {
            milestoneKey: "achievement:first_rejection",
            displayedAt: "2026-01-01T00:00:00.000Z",
            version: 1,
          },
        ],
        recentPlayfulLines: [],
      };
      window.localStorage.setItem("offerloop_milestones_v1", JSON.stringify(lifetime));
    });
    await page.reload();
    await expect(
      page.getByRole("heading", { name: "Step into Recruiter Mode" }),
    ).toBeVisible();

    await page.getByRole("button", { name: /^Reject /i }).click();
    const dialog = page.getByTestId("reject-reason-dialog");
    await dialog.getByRole("radio", { name: "Skills do not match" }).click();
    await dialog.getByRole("button", { name: "Confirm rejection" }).click();

    const toast = page.getByTestId("milestone-toast");
    await expect(toast).toBeVisible();
    await expect(toast).toContainText(/Hiring Committee|Hiring sprint|5/i);

    await page.reload();
    await expect(
      page.getByRole("heading", { name: "Step into Recruiter Mode" }),
    ).toBeVisible();
    await expect(page.getByTestId("milestone-toast")).toHaveCount(0);
  });

  test("disabled celebrations do not show toast UI", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();

    const celebrationsSwitch = page.getByLabel("Milestone celebrations");
    if (await celebrationsSwitch.isChecked()) {
      await celebrationsSwitch.click();
    }

    await page.goto("/reject");
    await page.evaluate(() => {
      window.localStorage.setItem(
        "offerloop_milestones_v1",
        JSON.stringify({
          version: 1,
          counts: {
            applications: 0,
            rejections: 4,
            shortlists: 0,
            offers_sent: 0,
            offers_received: 0,
            saved_jobs: 0,
          },
          unlockedAchievements: [],
          displayedMilestones: [],
          recentPlayfulLines: [],
        }),
      );
    });
    await page.reload();

    await page.getByRole("button", { name: /^Reject /i }).click();
    const dialog = page.getByTestId("reject-reason-dialog");
    await dialog.getByRole("radio", { name: "Skills do not match" }).click();
    await dialog.getByRole("button", { name: "Confirm rejection" }).click();

    await expect(page.getByTestId("session-feedback-bar")).toContainText("Rejected: 1");
    await expect(page.getByTestId("milestone-toast")).toHaveCount(0);
    await expect(page.getByTestId("milestone-dialog")).toHaveCount(0);
  });

  test("profile shows achievements progress section", async ({ page }) => {
    await page.goto("/profile#achievements");
    await expect(page.getByTestId("progress-summary-card")).toBeVisible();
    await expect(page.getByText("Stored on this device")).toBeVisible();
    await expect(page.getByText("First Leap")).toBeVisible();
  });
});
