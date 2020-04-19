import { EntitySchema } from 'typeorm';
import { Photo } from '../photo.entity';

export const PhotoSchema = new EntitySchema<Photo>({
  name: 'Photo',
  target: Photo,
  columns: {
    id: {
      type: Number,
      generated: true,
      primary: true,
    },
    name: {
      type: String,
    },
    description: {
      type: String,
    },
    filename: {
      type: String,
    },
    views: {
      type: Number,
    },
    isPublished: {
      type: Boolean,
    },
  },
});
