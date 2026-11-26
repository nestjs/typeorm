import { Logger } from '@nestjs/common';
import { defer, lastValueFrom, throwError } from 'rxjs';
import { handleRetry } from '../../lib';

describe('handleRetry', () => {
  let attempts: number;
  const failingConnection = defer(() => {
    attempts++;
    return throwError(() => new Error(`attempt ${attempts} failed`));
  });

  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    attempts = 0;
    errorSpy = vi.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
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

  it('does not announce a retry after the last attempt', async () => {
    await expect(
      lastValueFrom(failingConnection.pipe(handleRetry(2, 0))),
    ).rejects.toThrow('attempt 2 failed');
    const messages = errorSpy.mock.calls.map(([message]) => message);
    expect(messages).toEqual([
      'Unable to connect to the database. Retrying (1)...',
      'Unable to connect to the database.',
    ]);
  });

  it('does not announce a retry when retryAttempts is 0', async () => {
    await expect(
      lastValueFrom(failingConnection.pipe(handleRetry(0, 0))),
    ).rejects.toThrow('attempt 1 failed');
    expect(errorSpy).toHaveBeenCalledWith(
      'Unable to connect to the database.',
      expect.any(String),
    );
  });
});
