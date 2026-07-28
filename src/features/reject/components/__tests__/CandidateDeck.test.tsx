import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CandidateDeck } from "../CandidateDeck";
import { MotionPreferenceProvider } from "@/lib/motion/MotionPreferenceContext";
import { GuestSessionProvider } from "@/lib/context/GuestSessionContext";
import { candidates as allCandidates } from "@/data/candidates";
import type { FictionalCandidate } from "@/types/domain";
import {
  resolveDragDecision,
  SWIPE_THRESHOLD,
} from "@/features/reject/services/deckEngine";
import { writeGuestSettings, readGuestSettings } from "@/lib/storage/guestStore";

const recordAction = vi.fn(async () => undefined);

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
}));

vi.mock("@/lib/repositories/useRepositories", () => ({
  useRepositories: () => ({
    userId: "guest",
    repositories: {
      actions: { recordAction },
      profile: {
        getProfile: vi.fn(),
        updateProfile: vi.fn(),
      },
    },
  }),
}));

function renderDeck(candidates: FictionalCandidate[]) {
  return render(
    <MotionPreferenceProvider>
      <GuestSessionProvider>
        <CandidateDeck candidates={candidates} />
      </GuestSessionProvider>
    </MotionPreferenceProvider>,
  );
}

function threeCandidates(): FictionalCandidate[] {
  return allCandidates.slice(0, 3);
}

function sessionBar() {
  return screen.getByTestId("session-feedback-bar");
}

async function confirmRejection(
  user: ReturnType<typeof userEvent.setup>,
  reasonLabel = "Skills do not match",
  note?: string,
) {
  const dialog = await screen.findByTestId("reject-reason-dialog");
  await user.click(within(dialog).getByRole("radio", { name: reasonLabel }));
  if (note) {
    await user.type(
      within(dialog).getByLabelText("Optional fictional hiring note"),
      note,
    );
  }
  await user.click(within(dialog).getByRole("button", { name: "Confirm rejection" }));
}

describe("CandidateDeck rejection workflow", () => {
  beforeEach(() => {
    recordAction.mockReset();
    recordAction.mockResolvedValue(undefined);
    writeGuestSettings({
      ...readGuestSettings(),
      quickRejectionEnabled: false,
      defaultRejectionReason: "skills_mismatch",
    });
  });

  it("opens the rejection reason dialog from the Reject button without removing the candidate", async () => {
    const user = userEvent.setup();
    const candidates = threeCandidates();
    renderDeck(candidates);

    await user.click(
      screen.getByRole("button", {
        name: new RegExp(`^Reject ${candidates[0].displayName}`),
      }),
    );

    const dialog = await screen.findByTestId("reject-reason-dialog");
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText(candidates[0].displayName)).toBeInTheDocument();
    expect(sessionBar()).toHaveTextContent("Rejected: 0");
    expect(recordAction).not.toHaveBeenCalled();
  });

  it("keeps confirm disabled until a reason is selected", async () => {
    const user = userEvent.setup();
    renderDeck(threeCandidates());

    await user.click(screen.getByRole("button", { name: /^Reject /i }));
    const dialog = await screen.findByTestId("reject-reason-dialog");
    expect(within(dialog).getByRole("button", { name: "Confirm rejection" })).toBeDisabled();

    await user.click(within(dialog).getByRole("radio", { name: "Skills do not match" }));
    expect(
      within(dialog).getByRole("button", { name: "Confirm rejection" }),
    ).not.toBeDisabled();
  });

  it("cancel keeps the candidate and records no action", async () => {
    const user = userEvent.setup();
    const candidates = threeCandidates();
    renderDeck(candidates);

    await user.click(
      screen.getByRole("button", {
        name: new RegExp(`^Reject ${candidates[0].displayName}`),
      }),
    );
    const dialog = await screen.findByTestId("reject-reason-dialog");
    await user.click(within(dialog).getByRole("button", { name: "Cancel" }));

    await waitFor(() => {
      expect(screen.queryByTestId("reject-reason-dialog")).not.toBeInTheDocument();
    });
    expect(
      screen.getByRole("heading", { name: candidates[0].displayName }),
    ).toBeInTheDocument();
    expect(recordAction).not.toHaveBeenCalled();
    expect(sessionBar()).toHaveTextContent("Rejected: 0");
  });

  it("Escape closes the dialog before confirmation", async () => {
    const user = userEvent.setup();
    const candidates = threeCandidates();
    renderDeck(candidates);

    await user.click(screen.getByRole("button", { name: /^Reject /i }));
    expect(await screen.findByTestId("reject-reason-dialog")).toBeInTheDocument();
    await user.keyboard("{Escape}");

    await waitFor(() => {
      expect(screen.queryByTestId("reject-reason-dialog")).not.toBeInTheDocument();
    });
    expect(
      screen.getByRole("heading", { name: candidates[0].displayName }),
    ).toBeInTheDocument();
  });

  it("successful confirmation rejects the candidate, shows a receipt, and advances", async () => {
    const user = userEvent.setup();
    const candidates = threeCandidates();
    renderDeck(candidates);

    await user.click(
      screen.getByRole("button", {
        name: new RegExp(`^Reject ${candidates[0].displayName}`),
      }),
    );
    await confirmRejection(user, "Skills do not match", "Looking for deeper backend experience.");

    await waitFor(() => {
      expect(recordAction).toHaveBeenCalledWith(
        expect.objectContaining({
          actionType: "candidate_rejected",
          candidateId: candidates[0].id,
          metadata: expect.objectContaining({
            reasonCode: "skills_mismatch",
            reasonLabel: "Skills do not match",
            comment: "Looking for deeper backend experience.",
            simulationOnly: true,
          }),
        }),
      );
    });

    await waitFor(
      () => {
        expect(
          screen.getByRole("heading", { name: candidates[1].displayName }),
        ).toBeInTheDocument();
      },
      { timeout: 2500 },
    );

    expect(sessionBar()).toHaveTextContent("Rejected: 1");
    const receipt = await screen.findByTestId("decision-receipt");
    expect(receipt).toHaveTextContent(candidates[0].displayName);
    expect(receipt).toHaveTextContent("Skills do not match");
    expect(receipt).toHaveTextContent("Looking for deeper backend experience.");
    expect(receipt).toHaveTextContent("No real person was affected.");
  });

  it("failed persistence keeps the candidate and shows a retry message", async () => {
    recordAction.mockRejectedValueOnce({
      code: "42501",
      message: "permission denied",
    });
    const user = userEvent.setup();
    const candidates = threeCandidates();
    renderDeck(candidates);

    await user.click(
      screen.getByRole("button", {
        name: new RegExp(`^Reject ${candidates[0].displayName}`),
      }),
    );
    await confirmRejection(user);

    expect(
      await screen.findByText("Could not record this fictional decision. Try again."),
    ).toBeInTheDocument();
    expect(within(screen.getByTestId("reject-reason-dialog")).getByText(candidates[0].displayName)).toBeInTheDocument();
    expect(sessionBar()).toHaveTextContent("Rejected: 0");
    expect(screen.getByTestId("reject-reason-dialog")).toBeInTheDocument();
  });

  it("undo restores the candidate and clears the receipt", async () => {
    const user = userEvent.setup();
    const candidates = threeCandidates();
    renderDeck(candidates);

    await user.click(
      screen.getByRole("button", {
        name: new RegExp(`^Reject ${candidates[0].displayName}`),
      }),
    );
    await confirmRejection(user);

    await waitFor(() => expect(sessionBar()).toHaveTextContent("Rejected: 1"), {
      timeout: 2500,
    });
    expect(await screen.findByTestId("decision-receipt")).toBeInTheDocument();

    await user.click(screen.getAllByRole("button", { name: "Undo" })[0]);
    await waitFor(() => expect(sessionBar()).toHaveTextContent("Rejected: 0"));
    expect(
      screen.getByRole("heading", { name: candidates[0].displayName }),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("decision-receipt")).not.toBeInTheDocument();
  });

  it("Left Arrow opens the rejection dialog instead of rejecting immediately", async () => {
    const user = userEvent.setup();
    const candidates = threeCandidates();
    renderDeck(candidates);

    await user.keyboard("{ArrowLeft}");
    expect(await screen.findByTestId("reject-reason-dialog")).toBeInTheDocument();
    expect(sessionBar()).toHaveTextContent("Rejected: 0");
    expect(recordAction).not.toHaveBeenCalled();
  });

  it("quick rejection uses the configured default reason without opening the dialog", async () => {
    writeGuestSettings({
      ...readGuestSettings(),
      quickRejectionEnabled: true,
      defaultRejectionReason: "availability_mismatch",
    });
    const user = userEvent.setup();
    const candidates = threeCandidates();
    renderDeck(candidates);

    await user.click(
      screen.getByRole("button", {
        name: new RegExp(`^Reject ${candidates[0].displayName}`),
      }),
    );

    await waitFor(() => {
      expect(recordAction).toHaveBeenCalledWith(
        expect.objectContaining({
          actionType: "candidate_rejected",
          metadata: expect.objectContaining({
            reasonCode: "availability_mismatch",
            source: "quick_reject",
          }),
        }),
      );
    });
    expect(screen.queryByTestId("reject-reason-dialog")).not.toBeInTheDocument();

    await waitFor(() => expect(sessionBar()).toHaveTextContent("Rejected: 1"), {
      timeout: 2500,
    });
  });

  it("Choose reason opens the full dialog while quick mode is enabled", async () => {
    writeGuestSettings({
      ...readGuestSettings(),
      quickRejectionEnabled: true,
      defaultRejectionReason: "skills_mismatch",
    });
    const user = userEvent.setup();
    renderDeck(threeCandidates());

    await user.click(screen.getByRole("button", { name: /Choose rejection reason/i }));
    expect(await screen.findByTestId("reject-reason-dialog")).toBeInTheDocument();
    expect(recordAction).not.toHaveBeenCalled();
  });

  it("shortlisting and offering still work without the rejection dialog", async () => {
    const user = userEvent.setup();
    renderDeck(threeCandidates());

    await user.click(screen.getByRole("button", { name: /^Shortlist /i }));
    await waitFor(() => expect(sessionBar()).toHaveTextContent("Shortlisted: 1"), {
      timeout: 2500,
    });
    expect(screen.queryByTestId("reject-reason-dialog")).not.toBeInTheDocument();
  });

  it("does not size the deck viewport with oversized height utilities", () => {
    const { container } = renderDeck(threeCandidates());
    const viewport = container.querySelector('[data-testid="candidate-deck-viewport"]');
    expect(viewport?.className).not.toMatch(/min-h-\[\d{3,}px\]/);
    expect(viewport?.className).toMatch(/max-w-\[540px\]/);
  });

  it("renders an empty state once every candidate has been decided", async () => {
    const user = userEvent.setup();
    const candidates = allCandidates.slice(0, 1);
    renderDeck(candidates);

    await user.click(
      screen.getByRole("button", {
        name: new RegExp(`^Reject ${candidates[0].displayName}`),
      }),
    );
    await confirmRejection(user);

    await waitFor(
      () =>
        expect(
          screen.getByText("You've reviewed every fictional candidate"),
        ).toBeInTheDocument(),
      { timeout: 2500 },
    );
  });
});

describe("drag decision thresholds (layout-independent)", () => {
  it("returns null below the swipe threshold so the card can spring back", () => {
    expect(resolveDragDecision({ x: -SWIPE_THRESHOLD + 1, y: 0 })).toBeNull();
  });

  it("rejects when dragged left past the threshold", () => {
    expect(resolveDragDecision({ x: -SWIPE_THRESHOLD - 1, y: 0 })).toBe("reject");
  });
});
