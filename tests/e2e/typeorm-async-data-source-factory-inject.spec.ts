import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Server } from 'http';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { getDataSourceToken } from '../../lib';
import { AsyncDataSourceFactoryInjectModule } from '../src/async-data-source-factory-inject.module';

describe('TypeOrm (async configuration with dataSourceFactoryInject)', () => {
  let server: Server;
  let app: INestApplication;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [AsyncDataSourceFactoryInjectModule],
    }).compile();

    app = module.createNestApplication();
    server = app.getHttpServer();
    await app.init();
  });

  it('provides the injected dependency to `dataSourceFactory`', () => {
    const dataSource = app.get<DataSource>(getDataSourceToken());
    expect((dataSource.options as { applicationName?: string }).applicationName).toBe(
      'nestjs-typeorm-e2e',
    );
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
