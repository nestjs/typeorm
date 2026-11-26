import { Logger, Type } from '@nestjs/common';
import { Observable } from 'rxjs';
import { delay, retryWhen, scan } from 'rxjs/operators';
import { DataSource, EntityManager, EntitySchema, Repository } from 'typeorm';
import { CircularDependencyException } from '../exceptions/circular-dependency.exception.js';
import { DataSourceRef } from '../interfaces/data-source-ref.type.js';
import { EntityClassOrSchema } from '../interfaces/entity-class-or-schema.type.js';
import { DEFAULT_DATA_SOURCE_NAME } from '../typeorm.constants.js';
import { AbstractRepository } from './typeorm-compat.js';

const logger = new Logger('TypeOrmModule');

/**
 * This function returns the DataSource name for the given DataSource, DataSourceOptions
 * or dataSource name. TypeORM v1 removed `name` from `DataSource` and `DataSourceOptions`,
 * so it is read defensively while remaining backward compatible with 0.3.x
 * (where the user-supplied options still carry it).
 * @param {DataSource | DataSourceOptions | string} [dataSource='default'] This optional
 * parameter is either a DataSource, or a DataSourceOptions or a string.
 * @returns {string} The DataSource name, or 'default' when no name is set.
 *
 * @publicApi
 */
export function getDataSourceName(
  dataSource: DataSourceRef | { name?: string } = DEFAULT_DATA_SOURCE_NAME,
): string {
  if (typeof dataSource === 'string') {
    return dataSource;
  }
  return (
    (dataSource as { name?: string } | null)?.name || DEFAULT_DATA_SOURCE_NAME
  );
}

/**
 * This function generates an injection token for an Entity or Repository
 * @param {EntityClassOrSchema} entity parameter can either be an Entity or Repository
 * @param {DataSource | DataSourceOptions | string} [dataSource='default'] This optional parameter is either
 * a DataSource, or a DataSourceOptions or a string.
 * @returns {string} The Entity | Repository injection token
 *
 * @publicApi
 */
export function getRepositoryToken(
  entity: EntityClassOrSchema,
  dataSource: DataSourceRef = DEFAULT_DATA_SOURCE_NAME,
): Function | string {
  if (entity === null || entity === undefined) {
    throw new CircularDependencyException('@InjectRepository()');
  }
  const dataSourcePrefix = getDataSourcePrefix(dataSource);
  if (
    entity instanceof Function &&
    (entity.prototype instanceof Repository ||
      (AbstractRepository && entity.prototype instanceof AbstractRepository))
  ) {
    if (!dataSourcePrefix) {
      return entity;
    }
    return `${dataSourcePrefix}${getCustomRepositoryToken(entity)}`;
  }

  if (entity instanceof EntitySchema) {
    const schemaName = entity.options.target
      ? entity.options.target.name
      : entity.options.name;
    if (!schemaName) {
      throw new Error(
        'EntitySchema must have either "target" or "name" defined',
      );
    }
    return `${dataSourcePrefix}${schemaName}Repository`;
  }
  return `${dataSourcePrefix}${entity.name}Repository`;
}

/**
 * This function generates an injection token for an Entity or Repository
 * @param {Function} This parameter can either be an Entity or Repository
 * @returns {string} The Repository injection token
 *
 * @publicApi
 */
export function getCustomRepositoryToken(repository: Function): string {
  if (repository === null || repository === undefined) {
    throw new CircularDependencyException('@InjectRepository()');
  }
  return repository.name;
}

/**
 * This function returns a DataSource injection token for the given DataSource, DataSourceOptions or dataSource name.
 * @param {DataSource | DataSourceOptions | string} [dataSource='default'] This optional parameter is either
 * a DataSource, or a DataSourceOptions or a string.
 * @returns {string | Function} The DataSource injection token.
 *
 * @publicApi
 */
export function getDataSourceToken(
  dataSource: DataSourceRef = DEFAULT_DATA_SOURCE_NAME,
): string | Function | Type<DataSource> {
  const name = getDataSourceName(dataSource);
  return name === DEFAULT_DATA_SOURCE_NAME ? DataSource : `${name}DataSource`;
}

/**
 * @deprecated
 *
 * @publicApi
 */
export const getConnectionToken = getDataSourceToken;

/**
 * This function returns a DataSource prefix based on the dataSource name
 * @param {DataSource | DataSourceOptions | string} [dataSource='default'] This optional parameter is either
 * a DataSource, or a DataSourceOptions or a string.
 * @returns {string | Function} The DataSource injection token.
 */
export function getDataSourcePrefix(
  dataSource: DataSourceRef = DEFAULT_DATA_SOURCE_NAME,
): string {
  const name = getDataSourceName(dataSource);
  return name === DEFAULT_DATA_SOURCE_NAME ? '' : `${name}_`;
}

/**
 * This function returns an EntityManager injection token for the given DataSource, DataSourceOptions or dataSource name.
 * @param {DataSource | DataSourceOptions | string} [dataSource='default'] This optional parameter is either
 * a DataSource, or a DataSourceOptions or a string.
 * @returns {string | Function} The EntityManager injection token.
 */
export function getEntityManagerToken(
  dataSource: DataSourceRef = DEFAULT_DATA_SOURCE_NAME,
): string | Function {
  const name = getDataSourceName(dataSource);
  return name === DEFAULT_DATA_SOURCE_NAME
    ? EntityManager
    : `${name}EntityManager`;
}

const DEFAULT_RETRY_ATTEMPTS = 10;
const DEFAULT_RETRY_DELAY = 3000;

export function handleRetry(
  retryAttempts = DEFAULT_RETRY_ATTEMPTS,
  retryDelay = DEFAULT_RETRY_DELAY,
  dataSourceName = DEFAULT_DATA_SOURCE_NAME,
  verboseRetryLog = false,
  toRetry?: (err: any) => boolean,
): <T>(source: Observable<T>) => Observable<T> {
  // A limit that is not a number, such as the NaN that `Number()` makes of an
  // unset environment variable, gets its default: no comparison is true for
  // NaN, so the attempts would never run out, and a delay of NaN doesn't wait
  // at all. Infinity still retries forever.
  if (isNaN(retryAttempts)) {
    retryAttempts = DEFAULT_RETRY_ATTEMPTS;
  }
  if (isNaN(retryDelay)) {
    retryDelay = DEFAULT_RETRY_DELAY;
  }
  return <T>(source: Observable<T>) =>
    source.pipe(
      retryWhen((e) =>
        e.pipe(
          scan((errorCount, error: Error) => {
            if (toRetry && !toRetry(error)) {
              throw error;
            }
            const dataSourceInfo =
              dataSourceName === DEFAULT_DATA_SOURCE_NAME
                ? ''
                : ` (${dataSourceName})`;
            const verboseMessage = verboseRetryLog
              ? ` Message: ${error.message}.`
              : '';
            const isLastAttempt = errorCount + 1 >= retryAttempts;
            const retryMessage = isLastAttempt
              ? ''
              : ` Retrying (${errorCount + 1})...`;

            logger.error(
              `Unable to connect to the database${dataSourceInfo}.${verboseMessage}${retryMessage}`,
              error.stack,
            );
            if (isLastAttempt) {
              throw error;
            }
            return errorCount + 1;
          }, 0),
          delay(retryDelay),
        ),
      ),
    );
}

export const generateString = (): string => crypto.randomUUID();
