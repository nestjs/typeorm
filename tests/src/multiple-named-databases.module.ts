import { Module } from '@nestjs/common';
import { TypeOrmModule } from '../../lib';
import { PhotoSchemaModule } from './photo/schema/photo-schema.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({ name: 'default' }),
    TypeOrmModule.forRoot({ name: 'connection_2' }),
    PhotoSchemaModule,
  ],
})
export class MultipleNamedDatabasesModule {}