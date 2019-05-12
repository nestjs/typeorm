import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '../../../lib';
import { Photo } from './photo.entity';
import { CustomPhotoRepository } from './photo.repository';

@Injectable()
export class PhotoService {
  constructor(
    @InjectRepository(Photo, 'connection_2')
    private readonly photoRepository2: Repository<Photo>,
    @InjectRepository(Photo)
    private readonly photoRepository: Repository<Photo>,
    @InjectRepository(CustomPhotoRepository, 'connection_2')
    private readonly customPhotoRepository2: CustomPhotoRepository,
    private readonly customPhotoRepository: CustomPhotoRepository,
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
