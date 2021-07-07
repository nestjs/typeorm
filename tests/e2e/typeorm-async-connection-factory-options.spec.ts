import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AsyncConnectionFactoryOptionsFactoryModule } from '../src/async-connection-factory-options.module';
import { Server } from 'http';

describe('TypeOrm (async configuration with connectionFactory)', () => {
  let server: Server;
  let app: INestApplication;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [AsyncConnectionFactoryOptionsFactoryModule],
    }).compile();

    app = module.createNestApplication();
    server = app.getHttpServer();
    await app.init();
  });

  it(`should return created entity`, () => {
    return request(server)
      .post('/photo')
      .expect(201, { name: 'Nest', description: 'Is great!', views: 6000 });
  });

  afterEach(async () => {
    await app.close();
  });
});
