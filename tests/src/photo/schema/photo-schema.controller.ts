import { Controller, Get, Post } from '@nestjs/common';
import { Photo } from '../photo.entity';
import { PhotoSchemaService } from './photo-schema.service';

@Controller('photo')
export class PhotoSchemaController {
  constructor(private readonly photoService: PhotoSchemaService) {}

  @Get()
  findAll(): Promise<Photo[]> {
    return this.photoService.findAll();
  }

  @Post()
  create(): Promise<Photo> {
    return this.photoService.create();
  }
}
