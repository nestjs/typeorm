import { Module, DynamicModule, Global } from '@nestjs/common';
import { ConnectionOptions, Connection, createConnection } from 'typeorm';
import {
  getConnectionToken,
  getEntityManagerToken,
  handleRetry,
} from './typeorm.utils';
import { Observable } from 'rxjs';

@Global()
@Module({})
export class TypeOrmCoreModule {
  static forRoot(options?: ConnectionOptions): DynamicModule {
    const connectionProvider = {
      provide: getConnectionToken(options),
      useFactory: async () =>
        await Observable.from(createConnection(options))
          .pipe(handleRetry)
          .toPromise(),
    };
    const entityManagerProvider = {
      provide: getEntityManagerToken(options),
      useFactory: (connection: Connection) => connection.manager,
      inject: [getConnectionToken(options)],
    };
    return {
      module: TypeOrmCoreModule,
      providers: [entityManagerProvider, connectionProvider],
      exports: [entityManagerProvider, connectionProvider],
    };
  }
}
