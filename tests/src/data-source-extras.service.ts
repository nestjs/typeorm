import { Injectable } from '@nestjs/common';

@Injectable()
export class DataSourceExtrasService {
  getApplicationName(): string {
    return 'nestjs-typeorm-e2e';
  }
}
