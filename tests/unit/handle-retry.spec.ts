import { Logger } from '@nestjs/common';
import { defer, lastValueFrom, throwError } from 'rxjs';
import { handleRetry } from '../../lib';

describe('handleRetry', () => {
  let attempts: number;
  const failingConnection = defer(() => {
    attempts++;
    return throwError(() => new Error(`attempt ${attempts} failed`));
  });

  beforeEach(() => {
    attempts = 0;
    vi.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('makes 10 connection attempts when retryAttempts is not set', async () => {
    await expect(
      lastValueFrom(failingConnection.pipe(handleRetry(undefined, 0))),
    ).rejects.toThrow('attempt 10 failed');
    expect(attempts).toBe(10);
  });

  it('makes as many connection attempts as retryAttempts', async () => {
    await expect(
      lastValueFrom(failingConnection.pipe(handleRetry(3, 0))),
    ).rejects.toThrow('attempt 3 failed');
    expect(attempts).toBe(3);
  });

  it('stops after the first attempt when toRetry returns false', async () => {
    await expect(
      lastValueFrom(
        failingConnection.pipe(
          handleRetry(undefined, 0, undefined, false, () => false),
        ),
      ),
    ).rejects.toThrow('attempt 1 failed');
    expect(attempts).toBe(1);
  });
});
