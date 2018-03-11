import { Logger } from '@nestjs/common';

const logger = new Logger('TypeOrm');

export function getRepositoryToken(entity: Function) {
  return `${entity.name}Repository`;
}

export async function attemptConnectionCreation(connectMethod, options, attempt?) {
  const maxAttempts       = 5;
  const connectionAttempt = attempt || 1;

  try {
    return await connectMethod(options);
  } catch (err) {
    logger.error(`Connection Attempt #${connectionAttempt} failed. ${err.toString()}`);

    if (connectionAttempt >= maxAttempts) {
      throw err;
    }

    await sleep(getIdleTime(connectionAttempt));
    return attemptConnectionCreation(connectMethod, options, connectionAttempt + 1);
  }
}

function getIdleTime(attempt) {
  return 1000 * attempt;
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
