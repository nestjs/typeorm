import { Repository } from 'typeorm';
import { Photo } from '../photo.entity';

export class CustomPhotoSchemaRepository extends Repository<Photo> {}
