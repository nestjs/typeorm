import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as typeorm from 'typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import {
  getDataSourceToken,
  getEntityManagerToken,
  getRepositoryToken,
} from '../../lib';
import { ApplicationModule } from '../src/app.module';
import { Photo } from '../src/photo/photo.entity';
import { CustomPhotoRepository } from '../src/photo/photo.repository';
import { isTypeOrmV1 } from '../utils/typeorm-version';

// `Connection` was removed in TypeORM v1; read it loosely so this spec compiles
// against both 0.3.x and v1 type definitions.
const Connection = (typeorm as Record<string, unknown>).Connection as
  | Function
  | undefined;

describe('TypeOrm (dependency injection)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [ApplicationModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('injects an initialized DataSource', () => {
    const dataSource = app.get(DataSource);
    expect(dataSource).toBeInstanceOf(DataSource);
    expect(dataSource.isInitialized).toBe(true);
  });

  it('injects the default EntityManager bound to the DataSource', () => {
    const entityManager = app.get<EntityManager>(getEntityManagerToken());
    const dataSource = app.get(DataSource);
    expect(entityManager).toBeInstanceOf(EntityManager);
    expect(entityManager).toBe(dataSource.manager);
  });

  it('resolves a named DataSource by its token', () => {
    const named = app.get<DataSource>(getDataSourceToken('connection_2'));
    expect(named).toBeInstanceOf(DataSource);
    expect(named.isInitialized).toBe(true);
    expect(named).not.toBe(app.get(DataSource));
  });

  it('injects a custom repository (extends Repository)', () => {
    const repository = app.get<CustomPhotoRepository>(
      getRepositoryToken(CustomPhotoRepository),
    );
    expect(repository).toBeInstanceOf(Repository);
  });

  describe('Connection backward-compatibility alias', () => {
    it('matches the installed TypeORM major version', () => {
      if (isTypeOrmV1) {
        // v1 removed the `Connection` class, so no alias provider is registered.
        expect(Connection).toBeUndefined();
      } else {
        // 0.3.x: the `Connection` token aliases the default `DataSource`.
        const dataSource = app.get(DataSource);
        expect(app.get(Connection as Function)).toBe(dataSource);
      }
    });
  });
});
