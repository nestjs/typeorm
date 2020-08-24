import { DynamicModule, Module } from '@nestjs/common';
import { Connection, ConnectionOptions } from 'typeorm';
import { EntitiesMetadataStorage } from './entities-metadata.storage';
import { getCustomRepositoryEntity } from './helpers/get-custom-repository-entity';
import { EntityClassOrSchema } from './interfaces/entity-class-or-schema.type';
import {
  TypeOrmModuleAsyncOptions,
  TypeOrmModuleOptions,
} from './interfaces/typeorm-options.interface';
import { TypeOrmCoreModule } from './typeorm-core.module';
import { DEFAULT_CONNECTION_NAME } from './typeorm.constants';
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
    entities: EntityClassOrSchema[] = [],
    connection:
      | Connection
      | ConnectionOptions
      | string = DEFAULT_CONNECTION_NAME,
  ): DynamicModule {
    const providers = createTypeOrmProviders(entities, connection);
    const customRepositoryEntities = getCustomRepositoryEntity(entities);
    EntitiesMetadataStorage.addEntitiesByConnection(connection, [
      ...entities,
      ...customRepositoryEntities,
    ]);
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
