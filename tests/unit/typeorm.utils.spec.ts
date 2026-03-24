import { DataSource, EntityManager, EntitySchema, Repository } from 'typeorm';
import {
  getConnectionToken,
  getCustomRepositoryToken,
  getDataSourceName,
  getDataSourcePrefix,
  getDataSourceToken,
  getEntityManagerToken,
  getRepositoryToken,
} from '../../lib/common/typeorm.utils';
import { DEFAULT_DATA_SOURCE_NAME } from '../../lib/typeorm.constants';

class TestEntity {}
class TestRepository extends Repository<TestEntity> {}

describe('TypeORM Utils', () => {
  describe('getDataSourceToken', () => {
    it('should return DataSource class for default', () => {
      expect(getDataSourceToken()).toBe(DataSource);
    });

    it('should return named string token for string input', () => {
      expect(getDataSourceToken('myDb')).toBe('myDbDataSource');
    });

    it('should return DataSource for options without name', () => {
      expect(getDataSourceToken({} as any)).toBe(DataSource);
    });

    it('should return DataSource for options with default name', () => {
      expect(getDataSourceToken({ name: DEFAULT_DATA_SOURCE_NAME } as any)).toBe(
        DataSource,
      );
    });

    it('should return named string token for options with custom name', () => {
      expect(getDataSourceToken({ name: 'custom' } as any)).toBe(
        'customDataSource',
      );
    });
  });

  describe('getConnectionToken (backward compat)', () => {
    it('should be the same function as getDataSourceToken', () => {
      expect(getConnectionToken).toBe(getDataSourceToken);
    });
  });

  describe('getRepositoryToken', () => {
    it('should return entity name + Repository for entity class', () => {
      expect(getRepositoryToken(TestEntity)).toBe('TestEntityRepository');
    });

    it('should return the repository class itself for custom repository', () => {
      expect(getRepositoryToken(TestRepository)).toBe(TestRepository);
    });

    it('should return prefixed custom repo name for named datasource', () => {
      expect(getRepositoryToken(TestRepository, 'myDb')).toBe(
        'myDb_TestRepository',
      );
    });

    it('should handle EntitySchema with target', () => {
      const schema = new EntitySchema({
        name: 'TestSchema',
        target: TestEntity,
        columns: {},
      });
      expect(getRepositoryToken(schema)).toBe('TestEntityRepository');
    });

    it('should handle EntitySchema without target', () => {
      const schema = new EntitySchema({
        name: 'TestSchema',
        columns: {},
      });
      expect(getRepositoryToken(schema)).toBe('TestSchemaRepository');
    });

    it('should throw CircularDependencyException for null', () => {
      expect(() => getRepositoryToken(null as any)).toThrow();
    });
  });

  describe('getEntityManagerToken', () => {
    it('should return EntityManager class for default', () => {
      expect(getEntityManagerToken()).toBe(EntityManager);
    });

    it('should return named string token for string input', () => {
      expect(getEntityManagerToken('myDb')).toBe('myDbEntityManager');
    });

    it('should return EntityManager for options without name', () => {
      expect(getEntityManagerToken({} as any)).toBe(EntityManager);
    });

    it('should return named token for options with custom name', () => {
      expect(getEntityManagerToken({ name: 'custom' } as any)).toBe(
        'customEntityManager',
      );
    });
  });

  describe('getDataSourcePrefix', () => {
    it('should return empty string for default', () => {
      expect(getDataSourcePrefix()).toBe('');
    });

    it('should return name_ for string input', () => {
      expect(getDataSourcePrefix('myDb')).toBe('myDb_');
    });

    it('should return empty string for options without name', () => {
      expect(getDataSourcePrefix({} as any)).toBe('');
    });

    it('should return empty string for options with default name', () => {
      expect(getDataSourcePrefix({ name: DEFAULT_DATA_SOURCE_NAME } as any)).toBe(
        '',
      );
    });

    it('should return name_ for options with custom name', () => {
      expect(getDataSourcePrefix({ name: 'custom' } as any)).toBe('custom_');
    });
  });

  describe('getDataSourceName', () => {
    it('should return name from options', () => {
      expect(getDataSourceName({ name: 'myDb' })).toBe('myDb');
    });

    it('should return default when no name', () => {
      expect(getDataSourceName({} as any)).toBe(DEFAULT_DATA_SOURCE_NAME);
    });

    it('should return default for undefined name', () => {
      expect(getDataSourceName({ name: undefined } as any)).toBe(
        DEFAULT_DATA_SOURCE_NAME,
      );
    });
  });

  describe('getCustomRepositoryToken', () => {
    it('should return repository class name', () => {
      expect(getCustomRepositoryToken(TestRepository)).toBe('TestRepository');
    });

    it('should throw for null', () => {
      expect(() => getCustomRepositoryToken(null as any)).toThrow();
    });
  });
});
