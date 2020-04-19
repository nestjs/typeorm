import { Connection, ConnectionOptions } from 'typeorm';
import { EntityClassOrSchema } from './interfaces/entity-class-or-schema.type';

type ConnectionToken = Connection | ConnectionOptions | string;

export class EntitiesMetadataStorage {
  private static readonly storage = new Map<string, EntityClassOrSchema[]>();

  static addEntitiesByConnection(
    connection: ConnectionToken,
    entities: EntityClassOrSchema[],
  ) {
    const connectionToken =
      typeof connection === 'string' ? connection : connection.name;
    if (!connectionToken) {
      return;
    }

    let collection = this.storage.get(connectionToken);
    if (!collection) {
      collection = [];
      this.storage.set(connectionToken, collection);
    }
    entities.forEach((entity) => {
      if (collection!.includes(entity)) {
        return;
      }
      collection!.push(entity);
    });
  }

  static getEntitiesByConnection(
    connection: ConnectionToken,
  ): EntityClassOrSchema[] {
    const connectionToken =
      typeof connection === 'string' ? connection : connection.name;

    if (!connectionToken) {
      return [];
    }
    return this.storage.get(connectionToken) || [];
  }
}
