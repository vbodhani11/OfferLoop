const REJECT_MESSAGES = [
  "Candidate returned safely to the imaginary talent pool.",
  "Rejection delivered to absolutely nobody.",
  "No careers were affected by this decision.",
  "Your fictional hiring standards remain extremely high.",
  "The imaginary recruiting team has moved on.",
  "The simulated inbox remains completely unharmed.",
  "A fictional form email was not sent, because none of this is real.",
  "The talent pool ripples gently and reforms.",
];

export function getRandomRejectMessage(): string {
  return REJECT_MESSAGES[Math.floor(Math.random() * REJECT_MESSAGES.length)];
}
