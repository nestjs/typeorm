import { Module } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DuplicateDataSourceException, TypeOrmModule } from '../../lib';

describe('TypeOrm data source duplicate name validation', () => {
  it('should throw when two data sources fall back to the default name', () => {
    TypeOrmModule.forRoot({
      type: 'postgres',
      manualInitialization: true,
      retryAttempts: 0,
    });

    expect(() =>
      TypeOrmModule.forRoot({
        type: 'postgres',
        manualInitialization: true,
        retryAttempts: 0,
      }),
    ).toThrow(DuplicateDataSourceException);
  });

  it('should throw when two data sources share a non-default name', () => {
    TypeOrmModule.forRoot({
      name: 'duplicate',
      type: 'postgres',
      manualInitialization: true,
      retryAttempts: 0,
    });

    expect(() =>
      TypeOrmModule.forRoot({
        name: 'duplicate',
        type: 'postgres',
        manualInitialization: true,
        retryAttempts: 0,
      }),
    ).toThrow(DuplicateDataSourceException);
  });

  it('should throw when forRootAsync re-registers an existing name synchronously', () => {
    TypeOrmModule.forRoot({
      name: 'async-dup',
      type: 'postgres',
      manualInitialization: true,
      retryAttempts: 0,
    });

    expect(() =>
      TypeOrmModule.forRootAsync({
        name: 'async-dup',
        useFactory: () => ({
          type: 'postgres',
          manualInitialization: true,
          retryAttempts: 0,
        }),
      }),
    ).toThrow(DuplicateDataSourceException);
  });

  it('should allow registering data sources with unique names', () => {
    expect(() => {
      TypeOrmModule.forRoot({
        name: 'unique-a',
        type: 'postgres',
        manualInitialization: true,
        retryAttempts: 0,
      });
      TypeOrmModule.forRoot({
        name: 'unique-b',
        type: 'postgres',
        manualInitialization: true,
        retryAttempts: 0,
      });
    }).not.toThrow();
  });

  it('should free the name once the module is shut down', async () => {
    @Module({
      imports: [
        TypeOrmModule.forRoot({
          name: 'reusable',
          type: 'postgres',
          manualInitialization: true,
          retryAttempts: 0,
        }),
      ],
    })
    class FirstAppModule {}

    const firstModuleRef = await Test.createTestingModule({
      imports: [FirstAppModule],
    }).compile();
    const firstApp = firstModuleRef.createNestApplication();
    await firstApp.init();
    await firstApp.close();

    expect(() =>
      TypeOrmModule.forRoot({
        name: 'reusable',
        type: 'postgres',
        manualInitialization: true,
        retryAttempts: 0,
      }),
    ).not.toThrow();
  });
});
