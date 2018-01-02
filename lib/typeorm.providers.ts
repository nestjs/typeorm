import { ConnectionOptions, Connection } from 'typeorm';

import { getRepositoryToken } from './typeorm.utils';

export function createTypeOrmProviders(entities?: Function[]) {
  const getRepository = (connection: Connection, entity) =>
    connection.options.type === 'mongodb'
      ? connection.getMongoRepository(entity)
      : connection.getRepository(entity);

  const repositories = (entities || []).map(entity => ({
    provide: getRepositoryToken(entity),
    useFactory: (connection: Connection) =>
      getRepository(connection, entity) as any,
    inject: [Connection],
  }));
  return [...repositories];
}
