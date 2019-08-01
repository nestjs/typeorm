export class WrongModuleImportException extends Error {
  constructor() {
    super(
      'Import the TypeOrmModule by calling either TypeOrmModule.forRoot(), TypeOrmModule.forRootAsync(),' +
        ' TypeOrmModule.forFeature() inside the imports-array.',
    );
  }
}
