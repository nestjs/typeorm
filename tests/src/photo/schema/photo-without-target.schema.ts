import { EntitySchema } from 'typeorm';
import { Photo } from '../photo.entity';

export const PhotoWithoutTargetSchema = new EntitySchema<Photo>({
  name: 'photo-without-target',
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
