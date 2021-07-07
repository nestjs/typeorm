import { Module } from '@nestjs/common';
import { createConnection } from 'typeorm';
import { TypeOrmModule } from '../../lib';
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
      connectionFactory: async (options) => {
        // Realistically, this function would be used for more than simply creating a connection,
        // i.e. checking for an existing and active connection prior to creating a new one.
        // However, including that logic here causes runtime test errors about variables being used before assignment.
        // Therefore, given the simple nature of this test case, simply create and return a connection.
        const connection = await createConnection(options!);
        return connection;
      },
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
export class AsyncConnectionFactoryOptionsFactoryModule {}
