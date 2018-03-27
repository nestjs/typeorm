"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const typeorm_utils_1 = require("./typeorm.utils");
function createTypeOrmProviders(entities, connection) {
  const getRepository = (connection, entity) => {
    if (
      entity.prototype instanceof typeorm_1.Repository ||
      entity.prototype instanceof typeorm_1.AbstractRepository
    ) {
      return connection.getCustomRepository(entity);
    }
    return connection.options.type === "mongodb"
      ? connection.getMongoRepository(entity)
      : connection.getRepository(entity);
  };
  const getCustomRepository = (connection, entity) =>
    connection.getCustomRepository(entity);
  const repositories = (entities || []).map(entity => ({
    provide: typeorm_utils_1.getRepositoryToken(entity),
    useFactory: connection => {
      if (entity.prototype instanceof typeorm_1.Repository) {
        return getCustomRepository(connection, entity);
      }
      return getRepository(connection, entity);
    },
    inject: [typeorm_utils_1.getConnectionToken(connection)]
  }));
  return [...repositories];
}
exports.createTypeOrmProviders = createTypeOrmProviders;
