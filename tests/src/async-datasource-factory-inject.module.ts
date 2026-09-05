import { Injectable, Module } from '@nestjs/common';
import { DataSource, DataSourceOptions } from 'typeorm';
import { TypeOrmModule } from '../../lib';
import { Photo } from './photo/photo.entity';
import { PhotoModule } from './photo/photo.module';

@Injectable()
export class ConfigService {
  get(key: string): string {
    const config: Record<string, string> = {
      DB_HOST: '0.0.0.0',
      DB_PORT: '3306',
      DB_USERNAME: 'root',
      DB_PASSWORD: 'root',
      DB_NAME: 'test',
    };
    return config[key] || '';
  }
}

@Module({
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: () => ({
        type: 'postgres',
        entities: [Photo],
        synchronize: true,
        retryAttempts: 2,
        retryDelay: 1000,
      }),
      dataSourceFactory: async (options, configService: ConfigService) => {
        const dataSource = new DataSource({
          ...options,
          host: configService.get('DB_HOST'),
          port: parseInt(configService.get('DB_PORT'), 10),
          username: configService.get('DB_USERNAME'),
          password: configService.get('DB_PASSWORD'),
          database: configService.get('DB_NAME'),
        } as DataSourceOptions);
        return dataSource;
      },
      dataSourceFactoryInject: [ConfigService],
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
    PhotoModule,
  ],
})
export class AsyncDataSourceFactoryInjectModule {}
