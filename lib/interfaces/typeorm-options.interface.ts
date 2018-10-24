import { Type } from '@nestjs/common';
import { ModuleMetadata } from '@nestjs/common/interfaces';
import { ConnectionOptions } from 'typeorm';

export type TypeOrmModuleOptions = {
  retryAttempts?: number;
  retryDelay?: number;
  keepConnectionAlive?: boolean;
} & Partial<ConnectionOptions>;

export interface TypeOrmOptionsFactory {
  createTypeOrmOptions(
    name?: string,
  ): Promise<TypeOrmModuleOptions> | TypeOrmModuleOptions;
}

export interface TypeOrmModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  name?: string;
  useExisting?: Type<TypeOrmOptionsFactory>;
  useClass?: Type<TypeOrmOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<TypeOrmModuleOptions> | TypeOrmModuleOptions;
  inject?: any[];
}
