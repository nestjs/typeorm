import { ModuleMetadata, Provider, Type } from '@nestjs/common';
import { DataSource, DataSourceOptions } from 'typeorm';

export type TypeOrmModuleOptions = {
  /**
   * Number of times to retry connecting
   * Default: 10
   */
  retryAttempts?: number;
  /**
   * Delay between connection retry attempts (ms)
   * Default: 3000
   */
  retryDelay?: number;
  /**
   * Function that determines whether the module should
   * attempt to connect upon failure.
   *
   * @param err error that was thrown
   * @returns whether to retry connection or not
   */
  toRetry?: (err: any) => boolean;
  /**
   * If `true`, entities will be loaded automatically.
   */
  autoLoadEntities?: boolean;
  /**
   * If `true`, connection will not be closed on application shutdown.
   * @deprecated
   */
  keepConnectionAlive?: boolean;
  /**
   * If `true`, will show verbose error messages on each connection retry.
   */
  verboseRetryLog?: boolean;
  /**
   * If `true` database initialization will not be performed during module initialization.
   * This means that database connection will not be established and migrations will not run.
   * Database initialization will have to be performed manually using `DataSource.initialize`
   * and it will have to implement own retry mechanism (if necessary).
   */
  manualInitialization?: boolean;
} & Partial<DataSourceOptions>;

export interface TypeOrmOptionsFactory {
  createTypeOrmOptions(
    connectionName?: string,
  ): Promise<TypeOrmModuleOptions> | TypeOrmModuleOptions;
}

export type TypeOrmDataSourceFactory = (
  options?: DataSourceOptions,
) => Promise<DataSource>;

export interface TypeOrmModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  name?: string;
  useExisting?: Type<TypeOrmOptionsFactory>;
  useClass?: Type<TypeOrmOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<TypeOrmModuleOptions> | TypeOrmModuleOptions;
  dataSourceFactory?: TypeOrmDataSourceFactory;
  inject?: any[];
  extraProviders?: Provider[];
}
