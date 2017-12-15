import { Module, DynamicModule, Global } from '@nestjs/common';
import { ConnectionOptions } from 'typeorm';

import { createTypeOrmProviders } from './typeorm.providers';

@Global()
@Module({})
export class TypeOrmModule {
	static forRoot(
		entities: Function[] = [],
		options?: ConnectionOptions,
	): DynamicModule {
		const providers = createTypeOrmProviders(options, entities);
		return {
			module: TypeOrmModule,
			components: providers,
			exports: providers,
		};
	}
}
