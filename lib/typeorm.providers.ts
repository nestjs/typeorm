import { Provider } from '@nestjs/common';
import { DataSource, DataSourceOptions, EntityManager, getMetadataArgsStorage } from 'typeorm';
import { getDataSourceToken, getEntityManagerToken, getRepositoryToken } from './common/typeorm.utils';
import { EntityClassOrSchema } from './interfaces/entity-class-or-schema.type';

export function createTypeOrmProviders(
  entities?: EntityClassOrSchema[],
  dataSource?: DataSource | DataSourceOptions | string,
): Provider[] {
  return (entities || []).map((entity) => ({
    provide: getRepositoryToken(entity, dataSource),
    useFactory: (entityManager: EntityManager) => {
      const entityMetadata = entityManager.connection.entityMetadatas.find((meta) => meta.target === entity)
      const isTreeEntity = typeof entityMetadata?.treeType !== 'undefined'
      return isTreeEntity
        ? entityManager.getTreeRepository(entity)
        : entityManager.connection.options.type === 'mongodb'
          ? entityManager.getMongoRepository(entity)
          : entityManager.getRepository(entity);
    },
    inject: [getEntityManagerToken(dataSource)],
    /**
     * Extra property to workaround dynamic modules serialisation issue
     * that occurs when "TypeOrm#forFeature()" method is called with the same number
     * of arguments and all entities share the same class names.
     */
    targetEntitySchema: getMetadataArgsStorage().tables.find(
      (item) => item.target === entity,
    ),
  }));
}
