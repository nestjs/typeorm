import { DataSource, DataSourceOptions, EntityManager } from 'typeorm';
import {
  getDataSourcePrefix,
  getDataSourceToken,
  getEntityManagerToken,
  resolveDataSourceName,
} from '../../lib';
import { DataSourceRef } from '../../lib/interfaces/data-source-ref.type.js';

const unnamedOptions = { type: 'postgres' } as DataSourceOptions;
const fooOptions = { type: 'postgres', name: 'foo' } as DataSourceOptions;
const defaultOptions = {
  type: 'postgres',
  name: 'default',
} as DataSourceOptions;

const defaultRefs: [string, DataSourceRef | undefined][] = [
  ['no argument', undefined],
  ["'default'", 'default'],
  ['{}', {} as DataSourceOptions],
  ['options without name', unnamedOptions],
  ["{ name: 'default' }", defaultOptions],
];

const fooRefs: [string, DataSourceRef][] = [
  ["'foo'", 'foo'],
  ["{ name: 'foo' }", fooOptions],
];

describe('data source reference resolution', () => {
  describe.each(defaultRefs)('default data source via %s', (_, ref) => {
    it('resolves to the default name', () => {
      expect(resolveDataSourceName(ref)).toBe('default');
    });

    it('returns the DataSource class as data source token', () => {
      expect(getDataSourceToken(ref)).toBe(DataSource);
    });

    it('returns the EntityManager class as entity manager token', () => {
      expect(getEntityManagerToken(ref)).toBe(EntityManager);
    });

    it('returns an empty prefix', () => {
      expect(getDataSourcePrefix(ref)).toBe('');
    });
  });

  describe.each(fooRefs)('named data source via %s', (_, ref) => {
    it('resolves to the given name', () => {
      expect(resolveDataSourceName(ref)).toBe('foo');
    });

    it('returns a named data source token', () => {
      expect(getDataSourceToken(ref)).toBe('fooDataSource');
    });

    it('returns a named entity manager token', () => {
      expect(getEntityManagerToken(ref)).toBe('fooEntityManager');
    });

    it('returns a named prefix', () => {
      expect(getDataSourcePrefix(ref)).toBe('foo_');
    });
  });
});
