import { Logger, Type } from '@nestjs/common';
import { Observable } from 'rxjs';
import { delay, retryWhen, scan } from 'rxjs/operators';
import {
  AbstractRepository,
  Connection,
  ConnectionOptions,
  EntityManager,
  Repository,
} from 'typeorm';
import * as uuid from 'uuid/v4';

const logger = new Logger('TypeOrmModule');

/**
 * This function generates an injection token for an Entity or Repository
 * @param {Function} This parameter can either be an Entity or Repository
 * @param {string} [connection='default'] Connection name
 * @returns {string} The Entity | Repository injection token
 */
export function getRepositoryToken(
  entity: Function,
  connection: string = 'default',
) {
  if (
    entity.prototype instanceof Repository ||
    entity.prototype instanceof AbstractRepository
  ) {
    return `${connection}_${getCustomRepositoryToken(entity)}`;
  }
  return `${connection}_${entity.name}Repository`;
}

/**
 * This function generates an injection token for an Entity or Repository
 * @param {Function} This parameter can either be an Entity or Repository
 * @returns {string} The Repository injection token
 */
export function getCustomRepositoryToken(repository: Function) {
  return repository.name;
}

/**
 * This function returns a Connection injection token for the given Connection, ConnectionOptions or connection name.
 * @param {Connection | ConnectionOptions | string} [connection='default'] This optional parameter is either
 * a Connection, or a ConnectionOptions or a string.
 * @returns {string | Function} The Connection injection token.
 */
export function getConnectionToken(
  connection: Connection | ConnectionOptions | string = 'default',
): string | Function | Type<Connection> {
  return 'default' === connection
    ? Connection
    : 'string' === typeof connection
    ? `${connection}Connection`
    : 'default' === connection.name || !connection.name
    ? Connection
    : `${connection.name}Connection`;
}

/**
 * This function returns an EntityManager injection token for the given Connection, ConnectionOptions or connection name.
 * @param {Connection | ConnectionOptions | string} [connection='default'] This optional parameter is either
 * a Connection, or a ConnectionOptions or a string.
 * @returns {string | Function} The EntityManager injection token.
 */
export function getEntityManagerToken(
  connection: Connection | ConnectionOptions | string = 'default',
): string | Function {
  return 'default' === connection
    ? EntityManager
    : 'string' === typeof connection
    ? `${connection}EntityManager`
    : 'default' === connection.name || !connection.name
    ? EntityManager
    : `${connection.name}EntityManager`;
}

export function handleRetry(
  retryAttempts = 9,
  retryDelay = 3000,
): <T>(source: Observable<T>) => Observable<T> {
  return <T>(source: Observable<T>) =>
    source.pipe(
      retryWhen(e =>
        e.pipe(
          scan((errorCount, error: Error) => {
            logger.error(
              `Unable to connect to the database. Retrying (${errorCount +
                1})...`,
              error.stack,
            );
            if (errorCount + 1 >= retryAttempts) {
              throw error;
            }
            return errorCount + 1;
          }, 0),
          delay(retryDelay),
        ),
      ),
    );
}

export function getConnectionName(options: ConnectionOptions) {
  return options && options.name ? options.name : 'default';
}

export const generateString = () => uuid();
