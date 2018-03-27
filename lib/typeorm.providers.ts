import { ConnectionOptions, Connection, Repository } from 'typeorm';

import { getConnectionToken, getRepositoryToken } from './typeorm.utils';

export function createTypeOrmProviders(
  entities?: Function[],
  connection?: Connection | ConnectionOptions | string,
) {
  const getRepository = (connection: Connection, entity) => {
    if (entity.prototype instanceof Repository) {
      return connection.getCustomRepository(entity);
    }
    return connection.options.type === 'mongodb'
      ? connection.getMongoRepository(entity)
      : connection.getRepository(entity);
  }

  const repositories = (entities || []).map(entity => ({
    provide: getRepositoryToken(entity),
    useFactory: (connection: Connection) =>
      getRepository(connection, entity) as any,
    inject: [getConnectionToken(connection)],
  }));

  return [...repositories];
}
