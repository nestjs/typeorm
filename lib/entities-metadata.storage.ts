import { DataSource, DataSourceOptions } from 'typeorm';
import { EntityClassOrSchema } from './interfaces/entity-class-or-schema.type';

type DataSourceToken = DataSource | DataSourceOptions | string;

export class EntitiesMetadataStorage {
  private static readonly storage = new Map<string, EntityClassOrSchema[]>();

  static addEntitiesByDataSource(
    dataSource: DataSourceToken,
    entities: EntityClassOrSchema[],
  ): void {
    const dataSourceToken =
      typeof dataSource === 'string' ? dataSource : dataSource.name;
    if (!dataSourceToken) {
      return;
    }

    let collection = this.storage.get(dataSourceToken);
    if (!collection) {
      collection = [];
      this.storage.set(dataSourceToken, collection);
    }
    entities.forEach((entity) => {
      if (collection!.includes(entity)) {
        return;
      }
      collection!.push(entity);
    });
  }

  static getEntitiesByDataSource(
    dataSource: DataSourceToken,
  ): EntityClassOrSchema[] {
    const dataSourceToken =
      typeof dataSource === 'string' ? dataSource : dataSource.name;

    if (!dataSourceToken) {
      return [];
    }
    return this.storage.get(dataSourceToken) || [];
  }
}
