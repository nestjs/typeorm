import { TypeOrmCoreModule } from '../../lib/typeorm-core.module';
import { Logger } from '@nestjs/common';

describe('TypeOrmModule - validateDataSourceNames', () => {
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    warnSpy = jest
      .spyOn((TypeOrmCoreModule as any).logger, 'warn')
      .mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should log a warning when duplicate data source names are provided', () => {
    const options = [
      { name: 'default', type: 'sqlite', database: ':memory:' },
      { name: 'secondary', type: 'sqlite', database: ':memory:' },
      { name: 'secondary', type: 'sqlite', database: ':memory:' },
    ];

    (TypeOrmCoreModule as any)['validateDataSourceNames'](options);

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        'Duplicate DataSource names detected: [secondary]',
      ),
    );
  });

  it('should not log a warning when all data source names are unique', () => {
    const options = [
      { name: 'default', type: 'sqlite', database: ':memory:' },
      { name: 'secondary', type: 'sqlite', database: ':memory:' },
    ];

    (TypeOrmCoreModule as any)['validateDataSourceNames'](options);

    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('should treat missing names as "default" and log warning if repeated', () => {
    const options = [
      { type: 'sqlite', database: ':memory:' },
      { type: 'sqlite', database: ':memory:' },
    ];

    (TypeOrmCoreModule as any)['validateDataSourceNames'](options);

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Duplicate DataSource names detected: [default]'),
    );
  });

  it('should not log warning for a single configuration object', () => {
    const options = { name: 'default', type: 'sqlite', database: ':memory:' };

    (TypeOrmCoreModule as any)['validateDataSourceNames'](options);

    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('should handle an empty array without throwing or logging', () => {
    const options: any[] = [];

    expect(() => {
      (TypeOrmCoreModule as any)['validateDataSourceNames'](options);
    }).not.toThrow();

    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('should handle mixed named and unnamed configurations correctly', () => {
    const options = [
      { name: 'primary', type: 'sqlite', database: ':memory:' },
      { type: 'sqlite', database: ':memory:' },
      { type: 'sqlite', database: ':memory:' },
    ];

    (TypeOrmCoreModule as any)['validateDataSourceNames'](options);

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Duplicate DataSource names detected: [default]'),
    );
  });

  it('should log warning when multiple different duplicates exist', () => {
    const options = [
      { name: 'alpha', type: 'sqlite', database: ':memory:' },
      { name: 'alpha', type: 'sqlite', database: ':memory:' },
      { name: 'beta', type: 'sqlite', database: ':memory:' },
      { name: 'beta', type: 'sqlite', database: ':memory:' },
    ];

    (TypeOrmCoreModule as any)['validateDataSourceNames'](options);

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        'Duplicate DataSource names detected: [alpha, beta]',
      ),
    );
  });

  it('should handle case-sensitive names as different (no warning)', () => {
    const options = [
      { name: 'Main', type: 'sqlite', database: ':memory:' },
      { name: 'main', type: 'sqlite', database: ':memory:' },
    ];

    (TypeOrmCoreModule as any)['validateDataSourceNames'](options);

    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('should not crash if one of the configs is null or undefined', () => {
    const options = [
      { name: 'alpha', type: 'sqlite', database: ':memory:' },
      null as any,
      undefined as any,
      { name: 'beta', type: 'sqlite', database: ':memory:' },
    ];

    expect(() => {
      (TypeOrmCoreModule as any)['validateDataSourceNames'](options);
    }).not.toThrow();
  });

  it('should log warning if all names are missing (multiple "default")', () => {
    const options = [
      { type: 'sqlite', database: ':memory:' },
      { type: 'sqlite', database: ':memory:' },
      { type: 'sqlite', database: ':memory:' },
    ];

    (TypeOrmCoreModule as any)['validateDataSourceNames'](options);

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Duplicate DataSource names detected: [default]'),
    );
  });
});
