import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { MilestoneToast } from "../components/MilestoneToast";
import { MilestoneCelebrationDialog } from "../components/MilestoneCelebrationDialog";
import { AchievementBadge } from "../components/AchievementBadge";
import { ProgressSummaryCard } from "../components/ProgressSummaryCard";
import { emptyCategoryCounts } from "../types";

vi.mock("framer-motion", async () => {
  const actual = await vi.importActual<typeof import("framer-motion")>("framer-motion");
  return {
    ...actual,
    useReducedMotion: () => true,
  };
});

describe("MilestoneToast", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders five-action toast and can dismiss", () => {
    const onDismiss = vi.fn();
    render(
      <MilestoneToast
        celebration={{
          id: "applications:5",
          kind: "toast",
          category: "applications",
          threshold: 5,
          milestoneKey: "applications:5",
          title: "Application sprint complete",
          body: "5 fictional applications sent.",
          playfulLine: "Zero cover letters were harmed.",
        }}
        onDismiss={onDismiss}
      />,
    );
    expect(screen.getByTestId("milestone-toast")).toBeInTheDocument();
    expect(screen.getByText("Application sprint complete")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /dismiss milestone/i }));
    expect(onDismiss).toHaveBeenCalled();
  });

  it("auto-dismisses after duration", () => {
    const onDismiss = vi.fn();
    render(
      <MilestoneToast
        celebration={{
          id: "rejections:5",
          kind: "toast",
          category: "rejections",
          threshold: 5,
          milestoneKey: "rejections:5",
          title: "Hiring sprint complete",
          body: "5 fictional candidates reviewed.",
          playfulLine: "No real careers were affected.",
        }}
        onDismiss={onDismiss}
        durationMs={3500}
      />,
    );
    act(() => {
      vi.advanceTimersByTime(3500);
    });
    expect(onDismiss).toHaveBeenCalled();
  });
});

describe("MilestoneCelebrationDialog", () => {
  it("renders ten-action dialog and closes on Escape", () => {
    const onDismiss = vi.fn();
    render(
      <MilestoneCelebrationDialog
        celebration={{
          id: "applications:10",
          kind: "dialog",
          category: "applications",
          threshold: 10,
          milestoneKey: "applications:10",
          title: "Double digits!",
          body: "You completed 10 fictional applications.",
          playfulLine: "Your imaginary inbox is feeling optimistic.",
        }}
        intensity="minimal"
        confettiEnabled={false}
        onDismiss={onDismiss}
        onKeepGoing={onDismiss}
        onViewProgress={vi.fn()}
        autoDismissMs={60_000}
      />,
    );
    expect(screen.getByTestId("milestone-dialog")).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toHaveAccessibleName("Double digits!");
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onDismiss).toHaveBeenCalled();
  });

  it("does not render particles when intensity is minimal", () => {
    render(
      <MilestoneCelebrationDialog
        celebration={{
          id: "applications:10",
          kind: "dialog",
          category: "applications",
          threshold: 10,
          milestoneKey: "applications:10",
          title: "Double digits!",
          body: "You completed 10 fictional applications.",
          playfulLine: "Line",
        }}
        intensity="minimal"
        confettiEnabled={true}
        onDismiss={vi.fn()}
        onKeepGoing={vi.fn()}
        onViewProgress={vi.fn()}
        autoDismissMs={60_000}
      />,
    );
    expect(screen.queryByTestId("celebration-particles")).not.toBeInTheDocument();
  });
});

describe("AchievementBadge", () => {
  it("shows unlocked state and progress bar attributes", () => {
    render(
      <AchievementBadge
        code="application_machine"
        unlocked
        unlockedAt="2026-01-01T00:00:00.000Z"
        currentProgress={10}
      />,
    );
    expect(screen.getByTestId("achievement-badge-application_machine")).toHaveAttribute(
      "data-unlocked",
      "true",
    );
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "10");
    expect(screen.getByText("Unlocked")).toBeInTheDocument();
  });

  it("shows locked progress toward next badge", () => {
    render(
      <AchievementBadge
        code="application_veteran"
        unlocked={false}
        currentProgress={14}
      />,
    );
    expect(screen.getByText(/14 \/ 25/)).toBeInTheDocument();
    expect(screen.getByText(/11 more/)).toBeInTheDocument();
    expect(screen.getByText("Locked")).toBeInTheDocument();
  });
});

describe("ProgressSummaryCard", () => {
  it("renders counts and guest storage label", () => {
    render(
      <ProgressSummaryCard
        counts={{ ...emptyCategoryCounts(), applications: 3, rejections: 2 }}
        unlocked={[]}
        isGuest
      />,
    );
    expect(screen.getByTestId("progress-summary-card")).toBeInTheDocument();
    expect(screen.getByText("Stored on this device")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });
});
