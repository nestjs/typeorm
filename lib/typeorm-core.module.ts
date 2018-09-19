import {
  DynamicModule,
  Global,
  Inject,
  Module,
  OnModuleDestroy,
  Provider,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { defer } from 'rxjs';
import {
  Connection,
  ConnectionOptions,
  createConnection,
  getConnection,
} from 'typeorm';
import {
  generateString,
  getConnectionName,
  getConnectionToken,
  getEntityManagerToken,
  handleRetry,
} from './common/typeorm.utils';
import {
  TypeOrmModuleAsyncOptions,
  TypeOrmModuleOptions,
  TypeOrmOptionsFactory,
} from './interfaces/typeorm-options.interface';
import { TYPEORM_MODULE_ID, TYPEORM_MODULE_OPTIONS } from './typeorm.constants';

@Global()
@Module({})
export class TypeOrmCoreModule implements OnModuleDestroy {
  constructor(
    @Inject(TYPEORM_MODULE_OPTIONS)
    private readonly options: TypeOrmModuleOptions,
    private readonly moduleRef: ModuleRef,
  ) {}

  static forRoot(options: TypeOrmModuleOptions = {}): DynamicModule {
    const typeOrmModuleOptions = {
      provide: TYPEORM_MODULE_OPTIONS,
      useValue: options,
    };
    const connectionProvider = {
      provide: getConnectionToken(options as ConnectionOptions),
      useFactory: async () => await this.createConnectionFactory(options),
    };
    const entityManagerProvider = this.createEntityManagerProvider(
      options as ConnectionOptions,
    );
    return {
      module: TypeOrmCoreModule,
      providers: [
        entityManagerProvider,
        connectionProvider,
        typeOrmModuleOptions,
      ],
      exports: [entityManagerProvider, connectionProvider],
    };
  }

  static forRootAsync(options: TypeOrmModuleAsyncOptions): DynamicModule {
    const connectionProvider = {
      provide: getConnectionToken(options as ConnectionOptions),
      useFactory: async (typeOrmOptions: TypeOrmModuleOptions) => {
        if (options.name) {
          return await this.createConnectionFactory({
            ...typeOrmOptions,
            name: options.name,
          });
        }
        return await this.createConnectionFactory(typeOrmOptions);
      },
      inject: [TYPEORM_MODULE_OPTIONS],
    };
    const entityManagerProvider = {
      provide: getEntityManagerToken(options as ConnectionOptions),
      useFactory: (connection: Connection) => connection.manager,
      inject: [getConnectionToken(options as ConnectionOptions)],
    };

    const asyncProviders = this.createAsyncProviders(options);
    return {
      module: TypeOrmCoreModule,
      imports: options.imports,
      providers: [
        ...asyncProviders,
        entityManagerProvider,
        connectionProvider,
        {
          provide: TYPEORM_MODULE_ID,
          useValue: generateString(),
        },
      ],
      exports: [entityManagerProvider, connectionProvider],
    };
  }

  async onModuleDestroy() {
    if (this.options.keepConnectionAlive) {
      return;
    }
    const connection = this.moduleRef.get<Connection>(
      getConnectionToken(this.options as ConnectionOptions),
    );
    connection && (await connection.close());
  }

  private static createAsyncProviders(
    options: TypeOrmModuleAsyncOptions,
  ): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }
    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: options.useClass,
        useClass: options.useClass,
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
    return {
      provide: TYPEORM_MODULE_OPTIONS,
      useFactory: async (optionsFactory: TypeOrmOptionsFactory) =>
        await optionsFactory.createTypeOrmOptions(),
      inject: [options.useClass || options.useExisting],
    };
  }

  private static createEntityManagerProvider(
    options: ConnectionOptions,
  ): Provider {
    return {
      provide: getEntityManagerToken(options),
      useFactory: (connection: Connection) => connection.manager,
      inject: [getConnectionToken(options)],
    };
  }

  private static async createConnectionFactory(
    options: TypeOrmModuleOptions,
  ): Promise<Connection> {
    try {
      if (options.keepConnectionAlive) {
        return getConnection(getConnectionName(options as ConnectionOptions));
      }
    } catch {}

    return await defer(
      () =>
        options.type
          ? createConnection(options as ConnectionOptions)
          : createConnection(),
    )
      .pipe(handleRetry(options.retryAttempts, options.retryDelay))
      .toPromise();
  }
}
