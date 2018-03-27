import { Connection, ConnectionOptions } from 'typeorm';
export declare const InjectRepository: (entity: Function) => ParameterDecorator;
export declare const InjectConnection: (connection?: Connection | ConnectionOptions | string) => ParameterDecorator;
export declare const InjectEntityManager: (connection?: Connection | ConnectionOptions | string) => ParameterDecorator;
