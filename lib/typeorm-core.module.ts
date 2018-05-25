import { DynamicModule, Global, Module } from '@nestjs/common';
import { from } from 'rxjs';
import {
  Connection,
  ConnectionOptions,
  createConnection,
  getConnection,
} from 'typeorm';
import { TypeOrmModuleOptions } from './interfaces/typeorm-options.interface';
import {
  getConnectionName,
  getConnectionToken,
  getEntityManagerToken,
  handleRetry,
} from './typeorm.utils';

@Global()
@Module({})
export class TypeOrmCoreModule {
  static forRoot(
    options: TypeOrmModuleOptions & Partial<ConnectionOptions> = {},
  ): DynamicModule {
    const {
      retryAttempts,
      retryDelay,
      keepConnectionAlive,
      ...typeOrmOptions
    } = options;

    const connectionProvider = {
      provide: getConnectionToken(typeOrmOptions as ConnectionOptions),
      useFactory: async () => {
        try {
          if (keepConnectionAlive) {
            return getConnection(
              getConnectionName(typeOrmOptions as ConnectionOptions),
            );
          }
        } catch {}

        return await from(
          typeOrmOptions.type
            ? createConnection(typeOrmOptions as ConnectionOptions)
            : createConnection(),
        )
          .pipe(handleRetry(retryAttempts, retryDelay))
          .toPromise();
      },
    };
    const entityManagerProvider = {
      provide: getEntityManagerToken(options as ConnectionOptions),
      useFactory: (connection: Connection) => connection.manager,
      inject: [getConnectionToken(options as ConnectionOptions)],
    };
    return {
      module: TypeOrmCoreModule,
      providers: [entityManagerProvider, connectionProvider],
      exports: [entityManagerProvider, connectionProvider],
    };
  }
}
