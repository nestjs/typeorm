import { EntitiesMetadataStorage } from '../../lib/entities-metadata.storage';

class EntityA {}
class EntityB {}
class EntityC {}

describe('EntitiesMetadataStorage', () => {
  beforeEach(() => {
    // Reset storage between tests
    (EntitiesMetadataStorage as any).storage.clear();
  });

  describe('addEntitiesByDataSource', () => {
    it('should add entities with a string datasource name', () => {
      EntitiesMetadataStorage.addEntitiesByDataSource('test', [EntityA]);
      expect(EntitiesMetadataStorage.getEntitiesByDataSource('test')).toEqual([
        EntityA,
      ]);
    });

    it('should add entities with an options-like object', () => {
      EntitiesMetadataStorage.addEntitiesByDataSource(
        { name: 'myDb' } as any,
        [EntityA],
      );
      expect(
        EntitiesMetadataStorage.getEntitiesByDataSource('myDb'),
      ).toEqual([EntityA]);
    });

    it('should skip when options have no name', () => {
      EntitiesMetadataStorage.addEntitiesByDataSource({} as any, [EntityA]);
      expect(
        EntitiesMetadataStorage.getEntitiesByDataSource('default'),
      ).toEqual([]);
    });

    it('should accumulate entities for the same datasource', () => {
      EntitiesMetadataStorage.addEntitiesByDataSource('test', [EntityA]);
      EntitiesMetadataStorage.addEntitiesByDataSource('test', [EntityB]);
      expect(EntitiesMetadataStorage.getEntitiesByDataSource('test')).toEqual([
        EntityA,
        EntityB,
      ]);
    });

    it('should deduplicate entities', () => {
      EntitiesMetadataStorage.addEntitiesByDataSource('test', [
        EntityA,
        EntityB,
      ]);
      EntitiesMetadataStorage.addEntitiesByDataSource('test', [
        EntityA,
        EntityC,
      ]);
      expect(EntitiesMetadataStorage.getEntitiesByDataSource('test')).toEqual([
        EntityA,
        EntityB,
        EntityC,
      ]);
    });
  });

  describe('getEntitiesByDataSource', () => {
    it('should return empty array for unknown datasource', () => {
      expect(
        EntitiesMetadataStorage.getEntitiesByDataSource('unknown'),
      ).toEqual([]);
    });

    it('should return entities for string datasource name', () => {
      EntitiesMetadataStorage.addEntitiesByDataSource('test', [EntityA]);
      expect(EntitiesMetadataStorage.getEntitiesByDataSource('test')).toEqual([
        EntityA,
      ]);
    });

    it('should return entities when accessing via options object', () => {
      EntitiesMetadataStorage.addEntitiesByDataSource('myDb', [EntityA]);
      expect(
        EntitiesMetadataStorage.getEntitiesByDataSource({ name: 'myDb' } as any),
      ).toEqual([EntityA]);
    });

    it('should return empty when options have no name', () => {
      EntitiesMetadataStorage.addEntitiesByDataSource('default', [EntityA]);
      expect(
        EntitiesMetadataStorage.getEntitiesByDataSource({} as any),
      ).toEqual([]);
    });
  });
});
