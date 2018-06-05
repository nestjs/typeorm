import { Inject } from '@nestjs/common';
import { Connection, ConnectionOptions } from 'typeorm';

const AUTO_DECLARED_DEPS_METADATA = 'design:paramtypes';
const SELF_DECLARED_DEPS_METADATA = 'self:paramtypes';

import {
  getRepositoryToken,
  getConnectionToken,
  getEntityManagerToken,
} from './typeorm.utils';

export const InjectRepository = (entity: Function) =>
  Inject(getRepositoryToken(entity));

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

export function InjectedEventSubscriber(
  connection?: Connection | ConnectionOptions | string,
): ClassDecorator {
  return (target: any) => {
    const original = target;

    const f: any = function(...args) {
      const conn = args[0] as Connection;
      let instance = new original(...args.slice(1));
      Object.assign(conn, {
        subscribers: [].concat(conn.subscribers).concat([instance]),
      });
      return instance;
    };
    Object.defineProperty(f, 'name', { value: original.name });
    f.prototype = original.prototype;

    // Apply metadata from design type for NestJS auto-injection, and add the default connection
    const argsMetadata =
      Reflect.getMetadata(AUTO_DECLARED_DEPS_METADATA, target) || [];
    const newArgsMetadata = [Connection, ...argsMetadata];
    Reflect.defineMetadata(AUTO_DECLARED_DEPS_METADATA, newArgsMetadata, f);

    // Apply metadata from Token @Inject, and append Connection request as parameter to the decorator
    const manualMetadata =
      Reflect.getMetadata(SELF_DECLARED_DEPS_METADATA, target) || [];
    const newManualMetatadata = [
      ...manualMetadata.map((meta: any) =>
        Object.assign({}, meta, { index: meta.index + 1 }),
      ),
    ];
    if (connection) {
      newManualMetatadata.push({
        index: 0,
        param: getConnectionToken(connection),
      });
    }
    Reflect.defineMetadata(SELF_DECLARED_DEPS_METADATA, newManualMetatadata, f);

    // return new constructor (will override original)
    return f;
  };
}
