import { Module, DynamicModule, Global } from '@nestjs/common';
import {
  ConnectionOptions,
  Connection,
  createConnection,
  EntityManager,
} from 'typeorm';
import { attemptConnectionCreation } from './typeorm.utils';

@Global()
@Module({})
export class TypeOrmCoreModule {
  static forRoot(options?: ConnectionOptions): DynamicModule {
    const connectionProvider = {
      provide: Connection,
      useFactory: async () => await attemptConnectionCreation(createConnection, options),
    };
    const entityManagerProvider = {
      provide: EntityManager,
      useFactory: (connection: Connection) => connection.manager,
      inject: [Connection],
    };
    return {
      module: TypeOrmCoreModule,
      components: [entityManagerProvider, connectionProvider],
      exports: [entityManagerProvider, connectionProvider],
    };
  }
}
