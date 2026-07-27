/**
 * Deterministically derives a UUID-formatted string from a stable text seed
 * (e.g. `organization:nova-systems`). The same seed always produces the same
 * id, so our fictional catalog can use human-readable seeds in source while
 * still satisfying `uuid` primary key columns in Postgres — and, crucially,
 * so the *same* id is produced by local demo mode (running in the browser)
 * and by the generated Supabase seed data (running in Node for
 * `db:generate-seed`). That equality is what makes guest-to-account
 * migration work: a guest's locally stored `jobId` matches the real
 * `jobs.id` row once the user signs in.
 *
 * This is not cryptographically random and must never be used for anything
 * security-sensitive — it is purely a stable content identifier.
 */
function hash32(input: string, seed: number): number {
  let h = seed >>> 0;
  for (let i = 0; i < input.length; i++) {
    h = Math.imul(h ^ input.charCodeAt(i), 2654435761);
    h ^= h >>> 15;
  }
  h = Math.imul(h ^ (h >>> 13), 2246822519);
  h ^= h >>> 16;
  return h >>> 0;
}

export function deterministicUuid(seed: string): string {
  const a = hash32(seed, 0x9e3779b9).toString(16).padStart(8, "0");
  const b = hash32(seed, 0x85ebca6b).toString(16).padStart(8, "0");
  const c = hash32(seed, 0xc2b2ae35).toString(16).padStart(8, "0");
  const d = hash32(seed, 0x27d4eb2f).toString(16).padStart(8, "0");
  const hex = `${a}${b}${c}${d}`;

  const timeLow = hex.slice(0, 8);
  const timeMid = hex.slice(8, 12);
  const versionAndHigh = `4${hex.slice(13, 16)}`;
  const variantNibble = ((parseInt(hex[16], 16) & 0x3) | 0x8).toString(16);
  const variantAndRest = `${variantNibble}${hex.slice(17, 20)}`;
  const node = hex.slice(20, 32);

  return `${timeLow}-${timeMid}-${versionAndHigh}-${variantAndRest}-${node}`;
}
