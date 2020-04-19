import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '../../../../lib';
import { Photo } from '../photo.entity';
import { CustomPhotoSchemaRepository } from './photo-schema.repository';
import { PhotoWithoutTargetSchema } from './photo-without-target.schema';
import { PhotoSchema } from './photo.schema';

@Injectable()
export class PhotoSchemaService {
  constructor(
    @InjectRepository(PhotoWithoutTargetSchema)
    private readonly photoWithoutTargetRepository: Repository<Photo>,
    @InjectRepository(PhotoSchema, 'connection_2')
    private readonly photoRepository2: Repository<Photo>,
    @InjectRepository(PhotoSchema)
    private readonly photoRepository: Repository<Photo>,
    @InjectRepository(CustomPhotoSchemaRepository, 'connection_2')
    private readonly customPhotoRepository2: CustomPhotoSchemaRepository,
    private readonly customPhotoRepository: CustomPhotoSchemaRepository,
  ) {}

  async findAll(): Promise<Photo[]> {
    return await this.photoRepository.find();
  }

  async create(): Promise<Photo> {
    const photoEntity = new Photo();
    photoEntity.name = 'Nest';
    photoEntity.description = 'Is great!';
    photoEntity.views = 6000;

    return await this.photoRepository.create(photoEntity);
  }
}
