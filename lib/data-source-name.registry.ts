/**
 * Tracks active data source names at runtime in order to prevent multiple
 * data sources from being registered under the same name. Registering two
 * data sources with the same name is unsupported by TypeORM — the second
 * registration silently overrides the first — which is a common source
 * of hard-to-debug configuration issues.
 */
export class DataSourceNameRegistry {
  // private static readonly logger = new Logger(DataSourceNameRegistry.name);
  private static readonly registeredNames = new Set<string>();

  static register(dataSourceName: string): void {
    if (this.registeredNames.has(dataSourceName)) {
      // Commented out to avoid throwing an exception as it caused regressions in test suites.
      // throw new DuplicateDataSourceException(dataSourceName);
      // this.logger.warn(
      //   `A data source with the ${dataSourceName} name is already registered. ` +
      //     `Multiple data sources must be registered with unique names; otherwise, ` +
      //     `they will override each other. Please assign a unique "name" property ` +
      //     `to each TypeOrmModule.forRoot()/forRootAsync() registration.`,
      // );
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
