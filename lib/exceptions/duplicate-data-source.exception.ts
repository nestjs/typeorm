import { DEFAULT_DATA_SOURCE_NAME } from '../typeorm.constants.js';

export class DuplicateDataSourceException extends Error {
  constructor(dataSourceName: string) {
    const isDefault = dataSourceName === DEFAULT_DATA_SOURCE_NAME;
    const descriptor = isDefault ? 'default (unnamed)' : `"${dataSourceName}"`;
    super(
      `A data source with the ${descriptor} name is already registered. ` +
        `Multiple data sources must be registered with unique names; otherwise, ` +
        `they will override each other. Please assign a unique "name" property ` +
        `to each TypeOrmModule.forRoot()/forRootAsync() registration.`,
    );
  }
}
