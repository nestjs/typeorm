import { Module, DynamicModule, Global } from '@nestjs/common';
import { Connection, ConnectionOptions } from 'typeorm';

import { createTypeOrmProviders } from './typeorm.providers';
import { TypeOrmCoreModule } from './typeorm-core.module';

@Module({})
export class TypeOrmModule {
  static forRoot(options?: ConnectionOptions): DynamicModule {
    const providers = createTypeOrmProviders();
    return {
      module: TypeOrmModule,
      modules: [TypeOrmCoreModule.forRoot(options)],
    };
  }

  static forFeature(entities: Function[] = [], connection: Connection|ConnectionOptions|string = 'default'): DynamicModule {
    const providers = createTypeOrmProviders(entities, connection);
    return {
      module: TypeOrmModule,
      components: providers,
      exports: providers,
    };
  }
}
