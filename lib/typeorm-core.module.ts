import { Module, DynamicModule, Global } from '@nestjs/common';
import {
  ConnectionOptions,
  Connection,
  createConnection,
  EntityManager,
} from 'typeorm';
import { getConnectionToken } from "./typeorm.utils";

@Global()
@Module({})
export class TypeOrmCoreModule {
  static forRoot(options?: ConnectionOptions): DynamicModule {
    const connectionProvider = {
      provide: getConnectionToken(options),
      useFactory: async () => await createConnection(options),
    };
    const entityManagerProvider = {
      provide: EntityManager,
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
