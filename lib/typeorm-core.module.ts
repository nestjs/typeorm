import { Module, DynamicModule, Global } from '@nestjs/common';
import {
  ConnectionOptions,
  Connection,
  createConnection
} from 'typeorm';
import { getConnectionToken, getEntityManagerToken } from "./typeorm.utils";

@Global()
@Module({})
export class TypeOrmCoreModule {
  static forRoot(options?: ConnectionOptions): DynamicModule {
    const connectionProvider = {
      provide: getConnectionToken(options),
      useFactory: async () => await createConnection(options),
    };
    const entityManagerProvider = {
      provide: getEntityManagerToken(options),
      useFactory: (connection: Connection) => connection.manager,
      inject: [getConnectionToken(options)],
    };
    return {
      module: TypeOrmCoreModule,
      components: [entityManagerProvider, connectionProvider],
      exports: [entityManagerProvider, connectionProvider],
    };
  }
}
