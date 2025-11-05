import {
  DynamicModule,
  Global,
  Inject,
  Logger,
  Module,
  OnApplicationShutdown,
  Provider,
  Type,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { defer, lastValueFrom } from 'rxjs';
import {
  Connection,
  createConnection,
  DataSource,
  DataSourceOptions,
} from 'typeorm';
import {
  generateString,
  getDataSourceName,
  getDataSourceToken,
  getEntityManagerToken,
  handleRetry,
} from './common/typeorm.utils';
import { EntitiesMetadataStorage } from './entities-metadata.storage';
import {
  TypeOrmDataSourceFactory,
  TypeOrmModuleAsyncOptions,
  TypeOrmModuleOptions,
  TypeOrmOptionsFactory,
} from './interfaces/typeorm-options.interface';
import { TYPEORM_MODULE_ID, TYPEORM_MODULE_OPTIONS } from './typeorm.constants';

@Global()
@Module({})
export class TypeOrmCoreModule implements OnApplicationShutdown {
  private static readonly logger = new Logger('TypeOrmModule');

  private static validateDataSourceNames(
    options: TypeOrmModuleOptions | TypeOrmModuleOptions[],
  ): void {
    const configs = Array.isArray(options) ? options : [options];
    const names = new Map<string, number>();

    configs.forEach((config) => {
      if (!config) {
        return;
      }
      const name = (config as any).name || 'default';
      const count = names.get(name) || 0;
      names.set(name, count + 1);
    });

    const duplicates = Array.from(names.entries())
      .filter(([_, occurrences]) => occurrences > 1)
      .map(([name]) => name);

    if (duplicates.length > 0) {
      this.logger.warn(
        `⚠️ WARNING: Duplicate DataSource names detected: [${duplicates.join(', ')}]. ` +
          `Each DataSource should have a unique name to avoid conflicts.` +
          `Multiple DataSources with default name will result in unexpected behaviour.`,
      );
    }
  }

  constructor(
    @Inject(TYPEORM_MODULE_OPTIONS)
    private readonly options: TypeOrmModuleOptions,
    private readonly moduleRef: ModuleRef,
  ) {}

  static forRoot(options: TypeOrmModuleOptions = {}): DynamicModule {
    this.validateDataSourceNames(options);
    const typeOrmModuleOptions = {
      provide: TYPEORM_MODULE_OPTIONS,
      useValue: options,
    };
    const dataSourceProvider = {
      provide: getDataSourceToken(options as DataSourceOptions),
      useFactory: async () => await this.createDataSourceFactory(options),
    };
    const entityManagerProvider = this.createEntityManagerProvider(
      options as DataSourceOptions,
    );

    const providers = [
      entityManagerProvider,
      dataSourceProvider,
      typeOrmModuleOptions,
    ];
    const exports = [entityManagerProvider, dataSourceProvider];

    // TODO: "Connection" class is going to be removed in the next version of "typeorm"
    if (dataSourceProvider.provide === DataSource) {
      providers.push({
        provide: Connection,
        useExisting: DataSource,
      });
      exports.push(Connection);
    }

    return {
      module: TypeOrmCoreModule,
      providers,
      exports,
    };
  }

  static forRootAsync(options: TypeOrmModuleAsyncOptions): DynamicModule {
    const dataSourceProvider = {
      provide: getDataSourceToken(options as DataSourceOptions),
      useFactory: async (typeOrmOptions: TypeOrmModuleOptions) => {
        this.validateDataSourceNames(typeOrmOptions);
        if (options.name) {
          return await this.createDataSourceFactory(
            {
              ...typeOrmOptions,
              name: options.name,
            },
            options.dataSourceFactory,
          );
        }
        return await this.createDataSourceFactory(
          typeOrmOptions,
          options.dataSourceFactory,
        );
      },
      inject: [TYPEORM_MODULE_OPTIONS],
    };
    const entityManagerProvider = {
      provide: getEntityManagerToken(options as DataSourceOptions) as string,
      useFactory: (dataSource: DataSource) => dataSource.manager,
      inject: [getDataSourceToken(options as DataSourceOptions)],
    };

    const asyncProviders = this.createAsyncProviders(options);
    const providers = [
      ...asyncProviders,
      entityManagerProvider,
      dataSourceProvider,
      {
        provide: TYPEORM_MODULE_ID,
        useValue: generateString(),
      },
      ...(options.extraProviders || []),
    ];
    const exports: Array<Provider | Function> = [
      entityManagerProvider,
      dataSourceProvider,
    ];

    // TODO: "Connection" class is going to be removed in the next version of "typeorm"
    if (dataSourceProvider.provide === DataSource) {
      providers.push({
        provide: Connection,
        useExisting: DataSource,
      });
      exports.push(Connection);
    }

    return {
      module: TypeOrmCoreModule,
      imports: options.imports,
      providers,
      exports,
    };
  }

  async onApplicationShutdown(): Promise<void> {
    const dataSource = this.moduleRef.get<DataSource>(
      getDataSourceToken(this.options as DataSourceOptions) as Type<DataSource>,
    );
    try {
      if (dataSource && dataSource.isInitialized) {
        await dataSource.destroy();
      }
    } catch (e) {
      TypeOrmCoreModule.logger.error(e?.message);
    }
  }

  private static createAsyncProviders(
    options: TypeOrmModuleAsyncOptions,
  ): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }
    const useClass = options.useClass as Type<TypeOrmOptionsFactory>;
    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: useClass,
        useClass,
      },
    ];
  }

  private static createAsyncOptionsProvider(
    options: TypeOrmModuleAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: TYPEORM_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }
    // `as Type<TypeOrmOptionsFactory>` is a workaround for microsoft/TypeScript#31603
    const inject = [
      (options.useClass || options.useExisting) as Type<TypeOrmOptionsFactory>,
    ];
    return {
      provide: TYPEORM_MODULE_OPTIONS,
      useFactory: async (optionsFactory: TypeOrmOptionsFactory) =>
        await optionsFactory.createTypeOrmOptions(options.name),
      inject,
    };
  }

  private static createEntityManagerProvider(
    options: DataSourceOptions,
  ): Provider {
    return {
      provide: getEntityManagerToken(options) as string,
      useFactory: (dataSource: DataSource) => dataSource.manager,
      inject: [getDataSourceToken(options)],
    };
  }

  private static async createDataSourceFactory(
    options: TypeOrmModuleOptions,
    dataSourceFactory?: TypeOrmDataSourceFactory,
  ): Promise<DataSource> {
    const dataSourceToken = getDataSourceName(options as DataSourceOptions);
    const createTypeormDataSource =
      dataSourceFactory ??
      ((options: DataSourceOptions) => {
        return DataSource === undefined
          ? createConnection(options)
          : new DataSource(options);
      });
    return await lastValueFrom(
      defer(async () => {
        let dataSource: DataSource;
        if (!options.autoLoadEntities) {
          dataSource = await createTypeormDataSource(
            options as DataSourceOptions,
          );
        } else {
          let entities = options.entities;
          if (Array.isArray(entities)) {
            entities = entities.concat(
              EntitiesMetadataStorage.getEntitiesByDataSource(dataSourceToken),
            );
          } else {
            entities =
              EntitiesMetadataStorage.getEntitiesByDataSource(dataSourceToken);
          }
          dataSource = await createTypeormDataSource({
            ...options,
            entities,
          } as DataSourceOptions);
        }
        // TODO: remove "dataSource.initialize" condition (left for backward compatibility)
        return (dataSource as any).initialize &&
          !dataSource.isInitialized &&
          !options.manualInitialization
          ? dataSource.initialize()
          : dataSource;
      }).pipe(
        handleRetry(
          options.retryAttempts,
          options.retryDelay,
          dataSourceToken,
          options.verboseRetryLog,
          options.toRetry,
        ),
      ),
    );
  }
}
