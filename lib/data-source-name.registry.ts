import { DuplicateDataSourceException } from './exceptions/duplicate-data-source.exception';

/**
 * Tracks active data source names at runtime in order to prevent multiple
 * data sources from being registered under the same name. Registering two
 * data sources with the same name is unsupported by TypeORM — the second
 * registration silently overrides the first — which is a common source
 * of hard-to-debug configuration issues.
 */
export class DataSourceNameRegistry {
  private static readonly registeredNames = new Set<string>();

  static register(dataSourceName: string): void {
    if (this.registeredNames.has(dataSourceName)) {
      throw new DuplicateDataSourceException(dataSourceName);
    }
    this.registeredNames.add(dataSourceName);
  }

  static unregister(dataSourceName: string): void {
    this.registeredNames.delete(dataSourceName);
  }

  static has(dataSourceName: string): boolean {
    return this.registeredNames.has(dataSourceName);
  }

  static clear(): void {
    this.registeredNames.clear();
  }
}
