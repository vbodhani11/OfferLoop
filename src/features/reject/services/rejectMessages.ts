const RECEIPT_MESSAGES = [
  "Rejection delivered to absolutely nobody.",
  "Candidate returned safely to the imaginary talent pool.",
  "No careers were affected by this decision.",
  "The fictional hiring committee has spoken.",
  "Another completely simulated decision is complete.",
  "Imaginary inbox successfully cleared.",
  "Your fictional hiring standards remain impressively high.",
  "This decision exists only inside OfferLoop.",
] as const;

/**
 * Picks a playful receipt line, optionally excluding the previously shown one
 * so two decisions in a row never repeat the same message.
 */
export function pickRejectReceiptMessage(previous?: string): string {
  const pool =
    previous && RECEIPT_MESSAGES.length > 1
      ? RECEIPT_MESSAGES.filter((message) => message !== previous)
      : RECEIPT_MESSAGES;
  return pool[Math.floor(Math.random() * pool.length)];
}

let lastReceiptMessage: string | undefined;

export function getRandomRejectReceiptMessage(): string {
  lastReceiptMessage = pickRejectReceiptMessage(lastReceiptMessage);
  return lastReceiptMessage;
}

export function resetRejectReceiptMessageHistory(): void {
  lastReceiptMessage = undefined;
}

/** @deprecated Prefer getRandomRejectReceiptMessage — kept for existing toast call sites. */
export {
  pickRejectReceiptMessage as pickRejectMessage,
  getRandomRejectReceiptMessage as getRandomRejectMessage,
  resetRejectReceiptMessageHistory as resetRejectMessageHistory,
};

// Re-export the pool length for tests without exposing the mutable module state.
export const REJECT_RECEIPT_MESSAGE_COUNT = RECEIPT_MESSAGES.length;
