import { Provider } from '@nestjs/common';
import { DataSource, EntitySchema, getMetadataArgsStorage } from 'typeorm';
import {
  getDataSourceToken,
  getRepositoryToken,
} from './common/typeorm.utils.js';
import { DataSourceRef } from './interfaces/data-source-ref.type.js';
import { EntityClassOrSchema } from './interfaces/entity-class-or-schema.type.js';

export function createTypeOrmProviders(
  entities?: EntityClassOrSchema[],
  dataSource?: DataSourceRef,
): Provider[] {
  return (entities || []).map((entity) => ({
    provide: getRepositoryToken(entity, dataSource),
    useFactory: (dataSource: DataSource) => {
      if (dataSource.options.type === 'mongodb') {
        return dataSource.getMongoRepository(entity);
      }
      const target =
        entity instanceof EntitySchema
          ? (entity.options.target ?? entity.options.name)
          : entity;
      const entityMetadata = dataSource.entityMetadatas.find(
        (meta) => meta.target === target,
      );
      const isTreeEntity = typeof entityMetadata?.treeType !== 'undefined';
      return isTreeEntity
        ? dataSource.getTreeRepository(entity)
        : dataSource.getRepository(entity);
    },
    inject: [getDataSourceToken(dataSource)],
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
