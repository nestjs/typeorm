import { Logger, Type } from '@nestjs/common';
import { Observable } from 'rxjs';
import { delay, retryWhen, scan } from 'rxjs/operators';
import {
  AbstractRepository,
  Connection,
  DataSource,
  DataSourceOptions,
  EntityManager,
  EntitySchema,
  Repository,
} from 'typeorm';
import { v4 as uuid } from 'uuid';
import { CircularDependencyException } from '../exceptions/circular-dependency.exception';
import { EntityClassOrSchema } from '../interfaces/entity-class-or-schema.type';
import { DEFAULT_DATA_SOURCE_NAME } from '../typeorm.constants';

const logger = new Logger('TypeOrmModule');

/**
 * This function generates an injection token for an Entity or Repository
 * @param {EntityClassOrSchema} entity parameter can either be an Entity or Repository
 * @param {string} [dataSource='default'] DataSource name
 * @returns {string} The Entity | Repository injection token
 */
export function getRepositoryToken(
  entity: EntityClassOrSchema,
  dataSource:
    | DataSource
    | DataSourceOptions
    | string = DEFAULT_DATA_SOURCE_NAME,
): Function | string {
  if (entity === null || entity === undefined) {
    throw new CircularDependencyException('@InjectRepository()');
  }
  const dataSourcePrefix = getDataSourcePrefix(dataSource);
  if (
    entity instanceof Function &&
    (entity.prototype instanceof Repository ||
      entity.prototype instanceof AbstractRepository)
  ) {
    if (!dataSourcePrefix) {
      return entity;
    }
    return `${dataSourcePrefix}${getCustomRepositoryToken(entity)}`;
  }

  if (entity instanceof EntitySchema) {
    return `${dataSourcePrefix}${
      entity.options.target ? entity.options.target.name : entity.options.name
    }Repository`;
  }
  return `${dataSourcePrefix}${entity.name}Repository`;
}

/**
 * This function generates an injection token for an Entity or Repository
 * @param {Function} This parameter can either be an Entity or Repository
 * @returns {string} The Repository injection token
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
 */
export function getDataSourceToken(
  dataSource:
    | DataSource
    | DataSourceOptions
    | string = DEFAULT_DATA_SOURCE_NAME,
): string | Function | Type<DataSource> {
  return DEFAULT_DATA_SOURCE_NAME === dataSource
    ? DataSource ?? Connection
    : 'string' === typeof dataSource
    ? `${dataSource}DataSource`
    : DEFAULT_DATA_SOURCE_NAME === dataSource.name || !dataSource.name
    ? DataSource ?? Connection
    : `${dataSource.name}DataSource`;
}

/** @deprecated */
export const getConnectionToken = getDataSourceToken;

/**
 * This function returns a DataSource prefix based on the dataSource name
 * @param {DataSource | DataSourceOptions | string} [dataSource='default'] This optional parameter is either
 * a DataSource, or a DataSourceOptions or a string.
 * @returns {string | Function} The DataSource injection token.
 */
export function getDataSourcePrefix(
  dataSource:
    | DataSource
    | DataSourceOptions
    | string = DEFAULT_DATA_SOURCE_NAME,
): string {
  if (dataSource === DEFAULT_DATA_SOURCE_NAME) {
    return '';
  }
  if (typeof dataSource === 'string') {
    return dataSource + '_';
  }
  if (dataSource.name === DEFAULT_DATA_SOURCE_NAME || !dataSource.name) {
    return '';
  }
  return dataSource.name + '_';
}

/**
 * This function returns an EntityManager injection token for the given DataSource, DataSourceOptions or dataSource name.
 * @param {DataSource | DataSourceOptions | string} [dataSource='default'] This optional parameter is either
 * a DataSource, or a DataSourceOptions or a string.
 * @returns {string | Function} The EntityManager injection token.
 */
export function getEntityManagerToken(
  dataSource:
    | DataSource
    | DataSourceOptions
    | string = DEFAULT_DATA_SOURCE_NAME,
): string | Function {
  return DEFAULT_DATA_SOURCE_NAME === dataSource
    ? EntityManager
    : 'string' === typeof dataSource
    ? `${dataSource}EntityManager`
    : DEFAULT_DATA_SOURCE_NAME === dataSource.name || !dataSource.name
    ? EntityManager
    : `${dataSource.name}EntityManager`;
}

export function handleRetry(
  retryAttempts = 9,
  retryDelay = 3000,
  dataSourceName = DEFAULT_DATA_SOURCE_NAME,
  verboseRetryLog = false,
  toRetry?: (err: any) => boolean,
): <T>(source: Observable<T>) => Observable<T> {
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

            logger.error(
              `Unable to connect to the database${dataSourceInfo}.${verboseMessage} Retrying (${
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

export function getDataSourceName(options: DataSourceOptions): string {
  return options && options.name ? options.name : DEFAULT_DATA_SOURCE_NAME;
}

export const generateString = (): string => uuid();
