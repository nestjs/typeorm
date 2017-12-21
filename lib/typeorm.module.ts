import { Module, DynamicModule, Global } from '@nestjs/common';
import { ConnectionOptions } from 'typeorm';

import { createTypeOrmProviders } from './typeorm.providers';

@Global()
@Module({})
export class TypeOrmModule {
	static private pendingEntities: Function[] = [];

	static forRoot(
		entities: Function[] = [],
		options?: ConnectionOptions,
	): DynamicModule {
		const providers = createTypeOrmProviders(options, [
			...entities,
			...this.pendingEntities
		]);
		return {
			module: TypeOrmModule,
			components: providers,
			exports: providers,
		};
	}
	
	static forFeature(
		entities: Function[] = []
	): DynamicModule {
		this.pendingModels = [
			...entities,
			...this.pendingEntities
		];

		return this;
	}
}
