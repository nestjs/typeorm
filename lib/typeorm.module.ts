import { DynamicModule, Module } from '@nestjs/common';
import {
  AbstractRepository,
  Connection,
  ConnectionOptions,
  EntitySchema,
  getMetadataArgsStorage,
  Repository,
} from 'typeorm';
import { EntitiesMetadataStorage } from './entities-metadata.storage';
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
    let repEntities = [];
    for (let entity of entities) {
      if (
        entity instanceof Function &&
        (entity.prototype instanceof Repository ||
          entity.prototype instanceof AbstractRepository)
      ) {
        const entityRepositoryMetadataArgs = getMetadataArgsStorage().entityRepositories.find(
          (repository) => {
            return (
              repository.target ===
              (entity instanceof Function
                ? entity
                : (entity as any).constructor)
            );
          },
        );
        if (entityRepositoryMetadataArgs) {
          if (
            entities.indexOf(<any>entityRepositoryMetadataArgs.entity) === -1
          ) {
            repEntities.push(entityRepositoryMetadataArgs.entity);
          }
        }
      }
    }
    EntitiesMetadataStorage.addEntitiesByConnection(connection, [
      ...entities,
      ...repEntities,
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
