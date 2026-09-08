import { describe, expect, it } from 'vitest';
import { EntitySchema, Repository } from 'typeorm';
import {
  getCustomRepositoryToken,
  getDataSourceName,
  getDataSourcePrefix,
  getDataSourceToken,
  getEntityManagerToken,
  getRepositoryToken,
} from '../../lib/common/typeorm.utils.js';
import { CircularDependencyException } from '../../lib/exceptions/circular-dependency.exception.js';
import { DEFAULT_DATA_SOURCE_NAME } from '../../lib/typeorm.constants.js';

describe('typeorm.utils', () => {
  describe('getRepositoryToken', () => {
    class TestEntity {}

    class CustomRepository extends Repository<TestEntity> {}

    it('should return entity repository token for a class', () => {
      expect(getRepositoryToken(TestEntity)).toBe('TestEntityRepository');
    });

    it('should prefix token with dataSource name when provided as string', () => {
      expect(getRepositoryToken(TestEntity, 'tenant1')).toBe(
        'tenant1_TestEntityRepository',
      );
    });

    it('should prefix token with dataSource name when provided as DataSourceOptions object', () => {
      expect(getRepositoryToken(TestEntity, { name: 'analytics' } as any)).toBe(
        'analytics_TestEntityRepository',
      );
    });

    it('should return entity repository token for an EntitySchema with name', () => {
      const schema = new EntitySchema({
        name: 'UserSchema',
        columns: {},
      });
      expect(getRepositoryToken(schema)).toBe('UserSchemaRepository');
    });

    it('should return entity repository token for an EntitySchema with target', () => {
      class TargetEntity {}
      const schema = new EntitySchema({
        name: 'IgnoredName',
        target: TargetEntity,
        columns: {},
      });
      expect(getRepositoryToken(schema)).toBe('TargetEntityRepository');
    });

    it('should return custom repository directly if no prefix', () => {
      expect(getRepositoryToken(CustomRepository)).toBe(CustomRepository);
    });

    it('should prefix custom repository token when dataSource prefix is present', () => {
      expect(getRepositoryToken(CustomRepository, 'custom')).toBe(
        'custom_CustomRepository',
      );
    });

    it('should throw CircularDependencyException when entity is null or undefined', () => {
      expect(() => getRepositoryToken(null as any)).toThrow(
        CircularDependencyException,
      );
      expect(() => getRepositoryToken(undefined as any)).toThrow(
        CircularDependencyException,
      );
    });

    it('should throw an error when EntitySchema does not define target or name', () => {
      const schemaWithoutNameOrTarget = new EntitySchema({
        columns: {},
      } as any);

      expect(() => getRepositoryToken(schemaWithoutNameOrTarget)).toThrow(
        'EntitySchema must define either "target" or "name"',
      );
    });
  });

  describe('getCustomRepositoryToken', () => {
    class CustomRepo {}

    it('should return repository name', () => {
      expect(getCustomRepositoryToken(CustomRepo)).toBe('CustomRepo');
    });

    it('should throw CircularDependencyException when repository is null or undefined', () => {
      expect(() => getCustomRepositoryToken(null as any)).toThrow(
        CircularDependencyException,
      );
      expect(() => getCustomRepositoryToken(undefined as any)).toThrow(
        CircularDependencyException,
      );
    });
  });

  describe('getDataSourceToken', () => {
    it('should return DataSource class for default dataSource', () => {
      expect(getDataSourceToken()).toBeDefined();
      expect(getDataSourceToken(DEFAULT_DATA_SOURCE_NAME)).toBeDefined();
    });

    it('should return formatted token for string dataSource name', () => {
      expect(getDataSourceToken('custom')).toBe('customDataSource');
    });
  });

  describe('getEntityManagerToken', () => {
    it('should return EntityManager class for default dataSource', () => {
      expect(getEntityManagerToken()).toBeDefined();
    });

    it('should return formatted token for string dataSource name', () => {
      expect(getEntityManagerToken('custom')).toBe('customEntityManager');
    });
  });

  describe('getDataSourcePrefix', () => {
    it('should return empty string for default dataSource', () => {
      expect(getDataSourcePrefix()).toBe('');
      expect(getDataSourcePrefix(DEFAULT_DATA_SOURCE_NAME)).toBe('');
    });

    it('should return prefixed string for custom dataSource', () => {
      expect(getDataSourcePrefix('custom')).toBe('custom_');
    });
  });

  describe('getDataSourceName', () => {
    it('should return default name when options name is not provided', () => {
      expect(getDataSourceName({} as any)).toBe(DEFAULT_DATA_SOURCE_NAME);
    });

    it('should return name when options has name', () => {
      expect(getDataSourceName({ name: 'my_db' })).toBe('my_db');
    });
  });
});
