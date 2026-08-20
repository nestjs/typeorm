import { Module } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TypeOrmModule } from '../../lib';
import { DataSourceExtrasService } from './data-source-extras.service';
import { Photo } from './photo/photo.entity';
import { PhotoModule } from './photo/photo.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
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
      dataSourceFactory: async (
        options,
        dataSourceExtrasService: DataSourceExtrasService,
      ) => {
        return new DataSource({
          ...options!,
          applicationName: dataSourceExtrasService.getApplicationName(),
        });
      },
      dataSourceFactoryInject: [DataSourceExtrasService],
      extraProviders: [DataSourceExtrasService],
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
