import { Logger } from '@nestjs/common';
import { defer, lastValueFrom, of, throwError } from 'rxjs';
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

  describe('when a limit is not a number', () => {
    // Connects on the 21st attempt, so that a retry that never gives up
    // resolves instead of hanging the test
    const connectionUpAfter20Attempts = defer(() => {
      attempts++;
      return attempts > 20
        ? of('connected')
        : throwError(() => new Error(`attempt ${attempts} failed`));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('makes 10 connection attempts when retryAttempts is NaN', async () => {
      // e.g. `Number(process.env.DB_RETRY_ATTEMPTS)` when it is not set
      await expect(
        lastValueFrom(
          connectionUpAfter20Attempts.pipe(handleRetry(Number.NaN, 0)),
        ),
      ).rejects.toThrow('attempt 10 failed');
      expect(attempts).toBe(10);
    });

    it('waits 3000ms between attempts when retryDelay is NaN', async () => {
      vi.useFakeTimers();
      const connection = lastValueFrom(
        failingConnection.pipe(handleRetry(2, Number.NaN)),
      ).catch((err: Error) => err);

      await vi.advanceTimersByTimeAsync(2999);
      expect(attempts).toBe(1);
      await vi.advanceTimersByTimeAsync(1);
      expect(attempts).toBe(2);
      expect(await connection).toEqual(new Error('attempt 2 failed'));
    });

    it('keeps retrying until the connection succeeds when retryAttempts is Infinity', async () => {
      await expect(
        lastValueFrom(
          connectionUpAfter20Attempts.pipe(handleRetry(Infinity, 0)),
        ),
      ).resolves.toBe('connected');
      expect(attempts).toBe(21);
    });
  });
});
