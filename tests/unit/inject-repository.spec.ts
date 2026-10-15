import 'reflect-metadata';
import { SELF_DECLARED_DEPS_METADATA } from '@nestjs/common/constants.js';
import { DataSourceOptions, Repository } from 'typeorm';
import { InjectRepository } from '../../lib';
import { Photo } from '../src/photo/photo.entity';

const fooOptions = { type: 'postgres', name: 'foo' } as DataSourceOptions;

function injectedToken(target: Function): unknown {
  return Reflect.getMetadata(SELF_DECLARED_DEPS_METADATA, target)[0].param;
}

describe('InjectRepository', () => {
  it('accepts data source options as the data source reference', () => {
    class ByOptions {
      constructor(
        @InjectRepository(Photo, fooOptions)
        readonly repository: Repository<Photo>,
      ) {}
    }

    expect(injectedToken(ByOptions)).toBe('foo_PhotoRepository');
  });

  it('resolves options and name to the same token', () => {
    class ByName {
      constructor(
        @InjectRepository(Photo, 'foo')
        readonly repository: Repository<Photo>,
      ) {}
    }
    class ByOptions {
      constructor(
        @InjectRepository(Photo, fooOptions)
        readonly repository: Repository<Photo>,
      ) {}
    }

    expect(injectedToken(ByOptions)).toBe(injectedToken(ByName));
  });
});
