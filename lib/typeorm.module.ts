import { DynamicModule, Module } from '@nestjs/common';
import { Connection, ConnectionOptions } from 'typeorm';
import {
  TypeOrmModuleAsyncOptions,
  TypeOrmModuleOptions,
} from './interfaces/typeorm-options.interface';
import { TypeOrmCoreModule } from './typeorm-core.module';
import { createTypeOrmProviders } from './typeorm.providers';

@Module({})
export class TypeOrmModule {
  static forRoot(options?: TypeOrmModuleOptions): DynamicModule {
    return {
      module: TypeOrmModule,
      imports: [TypeOrmCoreModule.forRoot(options)],
    };
  }

  static forFeature(
    entities: Function[] = [],
    connection: Connection | ConnectionOptions | string = 'default',
  ): DynamicModule {
    const providers = createTypeOrmProviders(entities, connection);
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
