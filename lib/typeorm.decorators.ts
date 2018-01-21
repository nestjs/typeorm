import { Inject } from '@nestjs/common';
import { Connection, ConnectionOptions } from "typeorm";

import { getRepositoryToken, getConnectionToken, getEntityManagerToken } from './typeorm.utils';

export const InjectRepository = (entity: Function) =>
  Inject(getRepositoryToken(entity));

export const InjectConnection: (connection?: Connection|ConnectionOptions|string) => ParameterDecorator = (connection?: Connection|ConnectionOptions|string) =>
  Inject(getConnectionToken(connection));

export const InjectEntityManager: (connection?: Connection|ConnectionOptions|string) => ParameterDecorator = (connection?: Connection|ConnectionOptions|string) =>
  Inject(getEntityManagerToken(connection));