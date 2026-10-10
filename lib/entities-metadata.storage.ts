import { resolveDataSourceName } from './common/typeorm.utils.js';
import { DataSourceRef } from './interfaces/data-source-ref.type.js';
import { EntityClassOrSchema } from './interfaces/entity-class-or-schema.type.js';

export class EntitiesMetadataStorage {
  private static readonly storage = new Map<string, EntityClassOrSchema[]>();

  static addEntitiesByDataSource(
    dataSource: DataSourceRef,
    entities: EntityClassOrSchema[],
  ): void {
    const dataSourceName = resolveDataSourceName(dataSource);
    let collection = this.storage.get(dataSourceName);
    if (!collection) {
      collection = [];
      this.storage.set(dataSourceName, collection);
    }
    entities.forEach((entity) => {
      if (collection.includes(entity)) {
        return;
      }
      collection.push(entity);
    });
  }

  static getEntitiesByDataSource(
    dataSource: DataSourceRef,
  ): EntityClassOrSchema[] {
    return this.storage.get(resolveDataSourceName(dataSource)) || [];
  }
}
