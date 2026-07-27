/**
 * Minimal Node.js module resolution hook that allows extensionless relative
 * imports (e.g. `import { organizations } from "./organizations"`) to resolve
 * to their `.ts` file when run directly with `node --experimental-strip-types`.
 *
 * The `src/` tree is written for Next.js's bundler-style module resolution,
 * which allows omitting extensions. Plain Node ESM requires them, so this
 * hook bridges the gap for one-off scripts (like seed generation) that need
 * to import canonical TypeScript data files without a bundler.
 */
export async function resolve(specifier, context, nextResolve) {
  try {
    return await nextResolve(specifier, context);
  } catch (error) {
    if (specifier.startsWith(".") && !/\.[a-zA-Z0-9]+$/.test(specifier)) {
      return nextResolve(`${specifier}.ts`, context);
    }
    throw error;
  }
}
