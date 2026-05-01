import { createRequire } from 'node:module';

/**
 * Runtime compatibility helpers for accessing TypeORM APIs that were
 * removed in TypeORM v1.0.0 (notably `Connection` and `AbstractRepository`).
 *
 * Importing these symbols statically from `typeorm` would produce
 * TypeScript errors for consumers on TypeORM v1 when `skipLibCheck` is
 * disabled, and would cause runtime crashes inside `@nestjs/typeorm`
 * because the values resolve to `undefined`.
 *
 * Resolving them lazily via `require()` keeps the package working on
 * both TypeORM 0.3.x (where the symbols still exist) and 1.0.x
 * (where they have been removed) without forcing a type dependency.
 */

/**
 * Safely resolves an optional export from the installed `typeorm`
 * package. Returns `undefined` when the export is not present (e.g.
 * TypeORM v1.0.0 has removed it) or when the module fails to load.
 */
const require = createRequire(import.meta.url);

function resolveTypeormExport<T = unknown>(exportName: string): T | undefined {
  try {
    // Using `createRequire(import.meta.url)` here (rather than a static import) ensures the
    // reference is resolved at runtime and is not included in the
    // emitted type definitions — which is required for forward
    // compatibility with TypeORM v1 where these symbols no longer exist.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const typeorm = require('typeorm') as Record<string, unknown>;
    return typeorm[exportName] as T | undefined;
  } catch {
    return undefined;
  }
}

type OptionalCtor = (new (...args: any[]) => any) | undefined;

/**
 * The TypeORM `Connection` class (removed in TypeORM v1.0.0, replaced by
 * `DataSource` since 0.3.0). Resolves to `undefined` on TypeORM v1+.
 */
export const Connection: OptionalCtor =
  resolveTypeormExport<new (...args: any[]) => any>('Connection');

/**
 * The TypeORM `AbstractRepository` class (removed in TypeORM v1.0.0).
 * Resolves to `undefined` on TypeORM v1+.
 */
export const AbstractRepository: OptionalCtor =
  resolveTypeormExport<new (...args: any[]) => any>('AbstractRepository');
