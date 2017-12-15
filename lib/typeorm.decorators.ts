import { Inject } from '@nestjs/common';

import { getRepositoryToken } from './typeorm.utils';

export const InjectRepository = (entity: Function) =>
  Inject(getRepositoryToken(entity));
