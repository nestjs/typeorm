import { Module } from '@nestjs/common';
import { TypeOrmModule } from '../../lib';
import { PhotoSchemaModule } from './photo/schema/photo-schema.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: '0.0.0.0',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'test',
      synchronize: true,
      autoLoadEntities: true,
      retryAttempts: 2,
      retryDelay: 1000,
    }),
    PhotoSchemaModule,
    TypeOrmModule.forRoot({
      name: 'connection_2',
      type: 'postgres',
      host: '0.0.0.0',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'test',
      synchronize: true,
      autoLoadEntities: true,
      retryAttempts: 2,
      retryDelay: 1000,
    }),
  ],
})
export class AppSchemaModule {}
