import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { ApplicationModule } from '../src/app.module';
import { Server } from 'http';
import { TypeOrmModule } from '../../lib';
import { WrongModuleImportException } from '../../lib/exceptions/wrong-module-import.exception';

describe('TypeOrm', () => {
  let server: Server;
  let app: INestApplication;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [ApplicationModule],
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

  it('should throw an exception when the wrong TypeOrmModule is initialized', async () => {
    const module = Test.createTestingModule({
      imports: [TypeOrmModule],
    });

    try {
      await module.compile();
    } catch (err) {
      expect(err instanceof WrongModuleImportException).toBe(true);
    }
  });

  afterEach(async () => {
    await app.close();
  });
});
