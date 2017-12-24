import {
  ConnectionOptions,
  Connection,
  createConnection,
  EntityManager,
} from 'typeorm';

import { getRepositoryToken } from './typeorm.utils';

export function createTypeOrmProviders(
  options?: ConnectionOptions,
  entities?: Function[],
) {

  const connectionProvider = {
    provide: Connection,
    useFactory: async () => await createConnection(options),
  };

  const entityManagerProvider = {
    provide: EntityManager,
    useFactory: (connection: Connection) => connection.manager,
    inject: [Connection],
  };

  const getRepository = (connection: Connection, entity) =>
    connection.options.type === 'mongodb'
      ? connection.getMongoRepository(entity)
      : connection.getRepository(entity);

  let repositoryEntities = entities;
  if (!repositoryEntities && options && options.entities) {
    repositoryEntities = options.entities.filter(entity => (typeof entity !== 'string'))
  }

  const repositories = (repositoryEntities || []).map(entity => ({
    provide: getRepositoryToken(entity),
    useFactory: (connection: Connection) => getRepository(connection, entity) as any,
    inject: [Connection],
  }));
  return [connectionProvider, entityManagerProvider, ...repositories];
}
