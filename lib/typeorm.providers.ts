import { Provider } from '@nestjs/common';
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
): Provider[] {
  return (entities || []).map(entity => ({
    provide: getRepositoryToken(entity, connection),
    useFactory: (connection: Connection) => {
      if (
        entity.prototype instanceof Repository ||
        entity.prototype instanceof AbstractRepository
      ) {
        return connection.getCustomRepository(entity) as any;
      }

      return connection.options.type === 'mongodb'
        ? (connection.getMongoRepository(entity) as any)
        : (connection.getRepository(entity) as any);
    },
    inject: [getConnectionToken(connection)],
  }));
}
