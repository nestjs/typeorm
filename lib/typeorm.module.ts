import { DynamicModule, Module } from '@nestjs/common';
import { Connection, ConnectionOptions } from 'typeorm';
import {
  TypeOrmModuleAsyncOptions,
  TypeOrmModuleOptions,
} from './interfaces/typeorm-options.interface';
import { TypeOrmCoreModule } from './typeorm-core.module';
import {
  DEFAULT_CONNECTION_NAME,
  WRONG_MODULE_IMPORT,
} from './typeorm.constants';
import { createTypeOrmProviders } from './typeorm.providers';
import { WrongModuleImportException } from './exceptions/wrong-module-import.exception';

@Module({
  providers: [
    {
      provide: WRONG_MODULE_IMPORT,
      useFactory: () => {
        throw new WrongModuleImportException();
      },
    },
  ],
})
export class TypeOrmModule {
  static forRoot(options?: TypeOrmModuleOptions): DynamicModule {
    return {
      module: TypeOrmModule,
      imports: [TypeOrmCoreModule.forRoot(options)],
    };
  }

  static forFeature(
    entities: Function[] = [],
    connection:
      | Connection
      | ConnectionOptions
      | string = DEFAULT_CONNECTION_NAME,
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
