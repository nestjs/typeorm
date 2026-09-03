import { Repository } from 'typeorm';
import { Photo } from './photo.entity';

export class CustomPhotoRepository extends Repository<Photo> {}
