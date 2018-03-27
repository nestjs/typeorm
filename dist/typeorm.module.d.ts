import { DynamicModule } from '@nestjs/common';
import { Connection, ConnectionOptions } from 'typeorm';
export declare class TypeOrmModule {
    static forRoot(options?: ConnectionOptions): DynamicModule;
    static forFeature(entities?: Function[], connection?: Connection | ConnectionOptions | string): DynamicModule;
}
