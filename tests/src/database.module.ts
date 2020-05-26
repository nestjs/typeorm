import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '../../lib';
import { Photo } from './photo/photo.entity';

@Module({})
export class DatabaseModule {
  static async forRoot(): Promise<DynamicModule> {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
      module: DatabaseModule,
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: '0.0.0.0',
          port: 3306,
          username: 'root',
          password: 'root',
          database: 'test',
          entities: [Photo],
          synchronize: true,
          retryAttempts: 2,
          retryDelay: 1000,
        }),
        TypeOrmModule.forRoot({
          name: 'connection_2',
          type: 'postgres',
          host: '0.0.0.0',
          port: 3306,
          username: 'root',
          password: 'root',
          database: 'test',
          entities: [Photo],
          synchronize: true,
          retryAttempts: 2,
          retryDelay: 1000,
        }),
      ],
    };
  }
}
