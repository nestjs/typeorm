import { DynamicModule, Module } from '@nestjs/common';
import { DataSource, DataSourceOptions } from 'typeorm';
import { EntitiesMetadataStorage } from './entities-metadata.storage.js';
import { EntityClassOrSchema } from './interfaces/entity-class-or-schema.type.js';
import {
  TypeOrmModuleAsyncOptions,
  TypeOrmModuleOptions,
} from './interfaces/typeorm-options.interface.js';
import { TypeOrmCoreModule } from './typeorm-core.module.js';
import { DEFAULT_DATA_SOURCE_NAME } from './typeorm.constants.js';
import { createTypeOrmProviders } from './typeorm.providers.js';

/**
 * @publicApi
 */
@Module({})
export class TypeOrmModule {
  /**
   * Registers the TypeORM module with the given options.
   *
   * @param options The TypeORM data source options.
   * @param name Optional data source name. When provided, it overrides
   * `options.name` (if any) so the data source name can be configured
   * separately from the connection options – mirroring `forRootAsync`.
   */
  static forRoot(options?: TypeOrmModuleOptions, name?: string): DynamicModule {
    const resolvedOptions =
      name !== undefined ? { ...(options ?? {}), name } : options;
    return {
      module: TypeOrmModule,
      imports: [TypeOrmCoreModule.forRoot(resolvedOptions)],
    };
  }

  static forFeature(
    entities: EntityClassOrSchema[] = [],
    dataSource:
      | DataSource
      | DataSourceOptions
      | string = DEFAULT_DATA_SOURCE_NAME,
  ): DynamicModule {
    const providers = createTypeOrmProviders(entities, dataSource);
    EntitiesMetadataStorage.addEntitiesByDataSource(dataSource, [...entities]);
    return {
      module: TypeOrmModule,
      providers: providers,
      exports: providers,
    };
  }

  static forRootAsync(options: TypeOrmModuleAsyncOptions): DynamicModule {
    return {
      module: TypeOrmModule,
      imports: [TypeOrmCoreModule.forRootAsync(options)],
    };
  }
}
