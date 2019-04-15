import { Inject } from '@nestjs/common';
import { Connection, ConnectionOptions } from 'typeorm';
import { DEFAULT_CONNECTION_NAME } from '../typeorm.constants';
import {
  getConnectionToken,
  getEntityManagerToken,
  getRepositoryToken,
} from './typeorm.utils';

export const InjectRepository = (
  entity: Function,
  connection: string = DEFAULT_CONNECTION_NAME,
) => Inject(getRepositoryToken(entity, connection));

export const InjectConnection: (
  connection?: Connection | ConnectionOptions | string,
) => ParameterDecorator = (
  connection?: Connection | ConnectionOptions | string,
) => Inject(getConnectionToken(connection));

export const InjectEntityManager: (
  connection?: Connection | ConnectionOptions | string,
) => ParameterDecorator = (
  connection?: Connection | ConnectionOptions | string,
) => Inject(getEntityManagerToken(connection));
