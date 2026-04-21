import { Provider } from '@nestjs/common';
import { TypeOrmModule } from '../../lib';
import { TYPEORM_MODULE_OPTIONS } from '../../lib/typeorm.constants';

type ValueProvider = Provider & { provide: unknown; useValue: unknown };

function findOptionsValue(
  providers: Provider[] | undefined,
): Record<string, unknown> | undefined {
  if (!providers) {
    return undefined;
  }
  const match = providers.find(
    (provider): provider is ValueProvider =>
      typeof provider === 'object' &&
      provider !== null &&
      'provide' in provider &&
      (provider as ValueProvider).provide === TYPEORM_MODULE_OPTIONS,
  );
  return match?.useValue as Record<string, unknown> | undefined;
}

describe('TypeOrmModule.forRoot', () => {
  it('should accept a data source name as a second argument', () => {
    const options = {
      type: 'postgres' as const,
      host: '0.0.0.0',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'test',
    };

    const dynamicModule = TypeOrmModule.forRoot(options, 'named');
    const coreModule = dynamicModule.imports?.[0] as {
      providers?: Provider[];
    };
    const resolvedOptions = findOptionsValue(coreModule.providers);

    expect(resolvedOptions).toBeDefined();
    expect(resolvedOptions!.name).toBe('named');
    expect(resolvedOptions!.type).toBe('postgres');
  });

  it('should let the second argument override options.name', () => {
    const dynamicModule = TypeOrmModule.forRoot(
      {
        name: 'fromOptions',
        type: 'postgres' as const,
      },
      'fromArgument',
    );
    const coreModule = dynamicModule.imports?.[0] as {
      providers?: Provider[];
    };
    const resolvedOptions = findOptionsValue(coreModule.providers);

    expect(resolvedOptions!.name).toBe('fromArgument');
  });

  it('should keep options.name when no second argument is provided', () => {
    const dynamicModule = TypeOrmModule.forRoot({
      name: 'fromOptions',
      type: 'postgres' as const,
    });
    const coreModule = dynamicModule.imports?.[0] as {
      providers?: Provider[];
    };
    const resolvedOptions = findOptionsValue(coreModule.providers);

    expect(resolvedOptions!.name).toBe('fromOptions');
  });
});
