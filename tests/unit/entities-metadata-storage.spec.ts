import { DataSourceOptions } from 'typeorm';
import { EntitiesMetadataStorage } from '../../lib/entities-metadata.storage.js';

describe('EntitiesMetadataStorage', () => {
  it('stores entities added with unnamed options under the default data source', () => {
    class UnnamedOptionsEntity {}

    EntitiesMetadataStorage.addEntitiesByDataSource(
      { type: 'postgres' } as DataSourceOptions,
      [UnnamedOptionsEntity],
    );

    expect(
      EntitiesMetadataStorage.getEntitiesByDataSource('default'),
    ).toContain(UnnamedOptionsEntity);
  });

  it('keeps entities of a named data source separate from the default one', () => {
    class NamedOptionsEntity {}
    const name = 'entities-metadata-storage-spec';

    EntitiesMetadataStorage.addEntitiesByDataSource(
      { type: 'postgres', name } as DataSourceOptions,
      [NamedOptionsEntity],
    );

    expect(EntitiesMetadataStorage.getEntitiesByDataSource(name)).toEqual([
      NamedOptionsEntity,
    ]);
    expect(
      EntitiesMetadataStorage.getEntitiesByDataSource('default'),
    ).not.toContain(NamedOptionsEntity);
  });
});
