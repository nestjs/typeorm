import { Inject } from '@nestjs/common';
import { DataSourceRef } from '../interfaces/data-source-ref.type.js';
import { EntityClassOrSchema } from '../interfaces/entity-class-or-schema.type.js';
import { DEFAULT_DATA_SOURCE_NAME } from '../typeorm.constants.js';
import {
  getDataSourceToken,
  getEntityManagerToken,
  getRepositoryToken,
} from './typeorm.utils.js';

/**
 * @publicApi
 */
export const InjectRepository = (
  entity: EntityClassOrSchema,
  dataSource: string = DEFAULT_DATA_SOURCE_NAME,
): ReturnType<typeof Inject> => Inject(getRepositoryToken(entity, dataSource));

/**
 * @publicApi
 */
export const InjectDataSource: (
  dataSource?: DataSourceRef,
) => ReturnType<typeof Inject> = (dataSource?: DataSourceRef) =>
  Inject(getDataSourceToken(dataSource));

/** @deprecated */
export const InjectConnection = InjectDataSource;

/**
 * @publicApi
 */
export const InjectEntityManager: (
  dataSource?: DataSourceRef,
) => ReturnType<typeof Inject> = (dataSource?: DataSourceRef) =>
  Inject(getEntityManagerToken(dataSource));
