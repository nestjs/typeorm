import 'reflect-metadata';
import { Injectable } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DataSourceOptions, Repository } from 'typeorm';
import { getRepositoryToken, InjectRepository } from '../../lib';
import { Photo } from '../src/photo/photo.entity';

const fooOptions = { type: 'postgres', name: 'foo' } as DataSourceOptions;

@Injectable()
class ByName {
  constructor(
    @InjectRepository(Photo, 'foo')
    readonly repository: Repository<Photo>,
  ) {}
}

@Injectable()
class ByOptions {
  constructor(
    @InjectRepository(Photo, fooOptions)
    readonly repository: Repository<Photo>,
  ) {}
}

describe('InjectRepository', () => {
  const fooRepository = {} as Repository<Photo>;

  async function resolve<T>(target: new (...args: any[]) => T): Promise<T> {
    const moduleRef = await Test.createTestingModule({
      providers: [
        target,
        { provide: getRepositoryToken(Photo, 'foo'), useValue: fooRepository },
      ],
    }).compile();
    return moduleRef.get(target);
  }

  it('accepts data source options as the data source reference', async () => {
    expect((await resolve(ByOptions)).repository).toBe(fooRepository);
  });

  it('resolves options and name to the same repository', async () => {
    expect((await resolve(ByOptions)).repository).toBe(
      (await resolve(ByName)).repository,
    );
  });
});
