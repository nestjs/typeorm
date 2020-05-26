import { Module } from '@nestjs/common';
import { TypeOrmModule } from '../../../../lib';
import { PhotoSchemaController } from './photo-schema.controller';
import { CustomPhotoSchemaRepository } from './photo-schema.repository';
import { PhotoSchemaService } from './photo-schema.service';
import { PhotoWithoutTargetSchema } from './photo-without-target.schema';
import { PhotoSchema } from './photo.schema';

@Module({
  imports: [
    TypeOrmModule.forFeature([PhotoWithoutTargetSchema]),
    TypeOrmModule.forFeature([PhotoSchema, CustomPhotoSchemaRepository]),
    TypeOrmModule.forFeature(
      [PhotoSchema, CustomPhotoSchemaRepository],
      'connection_2',
    ),
  ],
  providers: [PhotoSchemaService],
  controllers: [PhotoSchemaController],
})
export class PhotoSchemaModule {}
