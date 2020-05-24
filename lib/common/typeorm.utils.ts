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
import { isNullOrUndefined } from 'util';
import { v4 as uuid } from 'uuid';
import { CircularDependencyException } from '../exceptions/circular-dependency.exception';
import { DEFAULT_CONNECTION_NAME } from '../typeorm.constants';

const logger = new Logger('TypeOrmModule');

/**
 * TypeORM 0.3.0 possible literal repository types.
 *
 * @see https://github.com/typeorm/typeorm/blob/b177e230a6fcb11f1eb71d4d431d0297436b7f6f/src/repository/Repository.ts#L29
 */
const typeormLiteralRepositoryTypes = [
  'Repository',
  'MongoRepository',
  'TreeRepository',
];

export function isLiteralRepository(value: any) {
  return typeormLiteralRepositoryTypes.includes(value.typeof);
}

/**
 * This function generates an injection token for an Entity or Repository
 * @param {Function} This parameter can either be an Entity or Repository
 * @param {string} [connection='default'] Connection name
 * @returns {string} The Entity | Repository injection token
 */
export function getRepositoryToken(
  entity: Function,
  connection: Connection | ConnectionOptions | string = DEFAULT_CONNECTION_NAME,
) {
  if (isNullOrUndefined(entity)) {
    throw new CircularDependencyException('@InjectRepository()');
  }
  const connectionPrefix = getConnectionPrefix(connection);
  const isTypeormNext = typeof Repository !== 'function';
  let name;

  if (
    !isTypeormNext &&
    (entity.prototype instanceof Repository ||
      entity.prototype instanceof AbstractRepository)
  ) {
    // TypeORM pre-0.3.0 repository class
    return `${connectionPrefix}${getCustomRepositoryToken(entity)}`;
  } else if (isTypeormNext && isLiteralRepository(entity)) {
    // TypeORM 0.3.0+ literal repository
    const repository: { target: Function | string } = entity as any;
    name =
      typeof repository.target === 'string'
        ? repository.target
        : repository.target.name;
  } else if (isTypeormNext) {
    /**
     * TypeORM 0.3.0+ entity can be different types - function, string or
     * literal with `name` property.
     *
     * @see https://github.com/typeorm/typeorm/blob/b177e230a6fcb11f1eb71d4d431d0297436b7f6f/src/common/EntityTarget.ts#L7
     */
    name = typeof entity === 'string' ? entity : entity.name;
  } else {
    // TypeORM pre-0.3.0 entity class
    name = entity.name;
  }

  return `${connectionPrefix}${name}Repository`;
}

/**
 * This function generates an injection token for an Entity or Repository
 * @param {Function} This parameter can either be an Entity or Repository
 * @returns {string} The Repository injection token
 */
export function getCustomRepositoryToken(repository: Function) {
  if (isNullOrUndefined(repository)) {
    throw new CircularDependencyException('@InjectRepository()');
  }
  return repository.name;
}

/**
 * This function returns a Connection injection token for the given Connection, ConnectionOptions or connection name.
 * @param {Connection | ConnectionOptions | string} [connection='default'] This optional parameter is either
 * a Connection, or a ConnectionOptions or a string.
 * @returns {string | Function} The Connection injection token.
 */
export function getConnectionToken(
  connection: Connection | ConnectionOptions | string = DEFAULT_CONNECTION_NAME,
): string | Function | Type<Connection> {
  return DEFAULT_CONNECTION_NAME === connection
    ? Connection
    : 'string' === typeof connection
    ? `${connection}Connection`
    : DEFAULT_CONNECTION_NAME === connection.name || !connection.name
    ? Connection
    : `${connection.name}Connection`;
}

/**
 * This function returns a Connection prefix based on the connection name
 * @param {Connection | ConnectionOptions | string} [connection='default'] This optional parameter is either
 * a Connection, or a ConnectionOptions or a string.
 * @returns {string | Function} The Connection injection token.
 */
export function getConnectionPrefix(
  connection: Connection | ConnectionOptions | string = DEFAULT_CONNECTION_NAME,
): string {
  if (connection === DEFAULT_CONNECTION_NAME) {
    return '';
  }
  if (typeof connection === 'string') {
    return connection + '_';
  }
  if (connection.name === DEFAULT_CONNECTION_NAME || !connection.name) {
    return '';
  }
  return connection.name + '_';
}

/**
 * This function returns an EntityManager injection token for the given Connection, ConnectionOptions or connection name.
 * @param {Connection | ConnectionOptions | string} [connection='default'] This optional parameter is either
 * a Connection, or a ConnectionOptions or a string.
 * @returns {string | Function} The EntityManager injection token.
 */
export function getEntityManagerToken(
  connection: Connection | ConnectionOptions | string = DEFAULT_CONNECTION_NAME,
): string | Function {
  return DEFAULT_CONNECTION_NAME === connection
    ? EntityManager
    : 'string' === typeof connection
    ? `${connection}EntityManager`
    : DEFAULT_CONNECTION_NAME === connection.name || !connection.name
    ? EntityManager
    : `${connection.name}EntityManager`;
}

export function handleRetry(
  retryAttempts = 9,
  retryDelay = 3000,
): <T>(source: Observable<T>) => Observable<T> {
  return <T>(source: Observable<T>) =>
    source.pipe(
      retryWhen((e) =>
        e.pipe(
          scan((errorCount, error: Error) => {
            logger.error(
              `Unable to connect to the database. Retrying (${
                errorCount + 1
              })...`,
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
  return options && options.name ? options.name : DEFAULT_CONNECTION_NAME;
}

export const generateString = () => uuid();
