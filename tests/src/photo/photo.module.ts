import { Module } from '@nestjs/common';
import { TypeOrmModule } from '../../../lib';
import { PhotoController } from './photo.controller';
import { Photo } from './photo.entity';
import { CustomPhotoRepository } from './photo.repository';
import { PhotoService } from './photo.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Photo, CustomPhotoRepository]),
    TypeOrmModule.forFeature([Photo, CustomPhotoRepository], 'connection_2'),
  ],
  providers: [PhotoService],
  controllers: [PhotoController],
})
export class PhotoModule {}
