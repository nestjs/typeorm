import { Injectable, Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import {
  getDataSourceToken,
  TypeOrmModule,
  TypeOrmModuleOptions,
  TypeOrmOptionsFactory,
} from '../../lib';
import { DataSourceNameRegistry } from '../../lib/data-source-name.registry';

const dataSourceOptions = {
  type: 'postgres' as const,
  host: '0.0.0.0',
  port: 3306,
  username: 'root',
  password: 'root',
  database: 'test',
  manualInitialization: true,
};

@Injectable()
class OptionsFactory implements TypeOrmOptionsFactory {
  createTypeOrmOptions(): TypeOrmModuleOptions {
    return dataSourceOptions;
  }
}

describe('TypeOrmCoreModule shutdown', () => {
  beforeEach(() => {
    DataSourceNameRegistry.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each([
    {
      case: 'named forRootAsync (name only on async options)',
      name: 'secondary',
      createModule: () =>
        TypeOrmModule.forRootAsync({
          name: 'secondary',
          useFactory: () => dataSourceOptions,
        }),
    },
    {
      case: 'named forRootAsync (factory returns a different name)',
      name: 'secondary',
      createModule: () =>
        TypeOrmModule.forRootAsync({
          name: 'secondary',
          useFactory: () => ({ ...dataSourceOptions, name: 'other' }),
        }),
    },
    {
      case: 'named forRootAsync (useClass)',
      name: 'secondary',
      createModule: () =>
        TypeOrmModule.forRootAsync({
          name: 'secondary',
          useClass: OptionsFactory,
        }),
    },
    {
      case: 'unnamed forRootAsync',
      name: 'default',
      createModule: () =>
        TypeOrmModule.forRootAsync({
          useFactory: () => dataSourceOptions,
        }),
    },
    {
      case: 'named forRoot',
      name: 'secondary',
      createModule: () =>
        TypeOrmModule.forRoot({
          ...dataSourceOptions,
          name: 'secondary',
        }),
    },
    {
      case: 'unnamed forRoot',
      name: 'default',
      createModule: () => TypeOrmModule.forRoot(dataSourceOptions),
    },
  ])(
    'destroys the data source and unregisters its name ($case)',
    async ({ name, createModule }) => {
      const loggerError = vi
        .spyOn(Logger.prototype, 'error')
        .mockImplementation(() => {});
      const staticLoggerError = vi
        .spyOn(Logger, 'error')
        .mockImplementation(() => {});

      const moduleRef = await Test.createTestingModule({
        imports: [createModule()],
      }).compile();

      expect(DataSourceNameRegistry.has(name)).toBe(true);

      const dataSource = moduleRef.get<DataSource>(getDataSourceToken(name));
      const destroy = vi.spyOn(dataSource, 'destroy').mockResolvedValue();
      vi.spyOn(dataSource, 'isInitialized', 'get').mockReturnValue(true);

      await moduleRef.close();

      expect(destroy).toHaveBeenCalledTimes(1);
      expect(DataSourceNameRegistry.has(name)).toBe(false);
      expect(loggerError).not.toHaveBeenCalled();
      expect(staticLoggerError).not.toHaveBeenCalled();
    },
  );

  it('logs and unregisters the name when destroying the data source fails', async () => {
    const loggerError = vi
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => {});

    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRootAsync({
          name: 'secondary',
          useFactory: () => dataSourceOptions,
        }),
      ],
    }).compile();

    const dataSource = moduleRef.get<DataSource>(
      getDataSourceToken('secondary'),
    );
    vi.spyOn(dataSource, 'destroy').mockRejectedValue(new Error('boom'));
    vi.spyOn(dataSource, 'isInitialized', 'get').mockReturnValue(true);

    await expect(moduleRef.close()).resolves.toBeUndefined();

    expect(loggerError).toHaveBeenCalledWith(
      'Failed to close the "secondary" data source: boom',
      expect.stringContaining('Error: boom'),
    );
    expect(DataSourceNameRegistry.has('secondary')).toBe(false);
  });
});
