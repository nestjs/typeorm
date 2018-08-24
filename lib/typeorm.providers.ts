import {
  AbstractRepository,
  Connection,
  ConnectionOptions,
  Repository,
} from 'typeorm';
import { getConnectionToken, getRepositoryToken } from './common/typeorm.utils';

export function createTypeOrmProviders(
  entities?: Function[],
  connection?: Connection | ConnectionOptions | string,
) {
  const getRepository = (connection: Connection, entity) => {
    if (
      entity.prototype instanceof Repository ||
      entity.prototype instanceof AbstractRepository
    ) {
      return connection.getCustomRepository(entity);
    }
    return connection.options.type === 'mongodb'
      ? connection.getMongoRepository(entity)
      : connection.getRepository(entity);
  };

  const getCustomRepository = (connection: Connection, entity) =>
    connection.getCustomRepository(entity);

  const repositories = (entities || []).map(entity => ({
    provide: getRepositoryToken(entity),
    useFactory: (connection: Connection) => {
      if (entity.prototype instanceof Repository) {
        return getCustomRepository(connection, entity) as any;
      }
      return getRepository(connection, entity) as any;
    },
    inject: [getConnectionToken(connection)],
  }));

  return [...repositories];
}
