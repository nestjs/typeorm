import { EntitySchema } from 'typeorm';
import { getRepositoryToken } from '../../lib';

describe('getRepositoryToken (EntitySchema)', () => {
  it('uses options.target.name when target is set', () => {
    class Photo {}
    const schema = new EntitySchema<Photo>({
      name: 'photo_ignored_when_target_present',
      target: Photo,
      columns: {},
    });

    expect(getRepositoryToken(schema)).toBe('PhotoRepository');
  });

  it('uses options.name when target is not set', () => {
    const schema = new EntitySchema({
      name: 'Photo',
      columns: {},
    });

    expect(getRepositoryToken(schema)).toBe('PhotoRepository');
  });

  it('throws when neither target nor name is defined', () => {
    const schema = new EntitySchema({
      columns: {},
    } as ConstructorParameters<typeof EntitySchema>[0]);

    expect(() => getRepositoryToken(schema)).toThrow(
      'EntitySchema must have either "target" or "name" defined',
    );
  });
});
