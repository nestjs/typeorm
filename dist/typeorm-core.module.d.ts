import { DynamicModule } from '@nestjs/common';
import { ConnectionOptions } from 'typeorm';
export declare class TypeOrmCoreModule {
    static forRoot(options?: ConnectionOptions): DynamicModule;
}
