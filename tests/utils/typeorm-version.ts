import * as typeorm from 'typeorm';

/**
 * Detects the installed TypeORM major version by feature detection rather than
 * by reading `typeorm/package.json` — the latter is blocked by TypeORM's
 * `exports` map on both 0.3.x and v1. The legacy `Connection` class was removed
 * in v1, so its absence is a reliable v1 signal.
 */
export const isTypeOrmV1 =
  typeof (typeorm as Record<string, unknown>).Connection === 'undefined';
