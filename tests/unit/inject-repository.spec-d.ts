import { describe, expectTypeOf, it } from 'vitest';
import { InjectRepository } from '../../lib/index.js';
import { DataSourceRef } from '../../lib/interfaces/data-source-ref.type.js';

describe('InjectRepository', () => {
  it('accepts any data source reference', () => {
    expectTypeOf(InjectRepository)
      .parameter(1)
      .toEqualTypeOf<DataSourceRef | undefined>();
  });
});
