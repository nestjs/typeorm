import { ConnectionOptions, Connection } from 'typeorm';
export declare function createTypeOrmProviders(entities?: Function[], connection?: Connection | ConnectionOptions | string): {
    provide: string;
    useFactory: (connection: Connection) => any;
    inject: (string | Function)[];
}[];
