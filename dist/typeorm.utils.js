"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const operators_1 = require("rxjs/operators");
const common_1 = require("@nestjs/common");
function getRepositoryToken(entity) {
  return `${entity.name}Repository`;
}
exports.getRepositoryToken = getRepositoryToken;
function getConnectionToken(connection = "default") {
  return "default" === connection
    ? typeorm_1.Connection
    : "string" === typeof connection
      ? `${connection}Connection`
      : "default" === connection.name || !connection.name
        ? typeorm_1.Connection
        : `${connection.name}Connection`;
}
exports.getConnectionToken = getConnectionToken;
function getEntityManagerToken(connection = "default") {
  return "default" === connection
    ? typeorm_1.EntityManager
    : "string" === typeof connection
      ? `${connection}EntityManager`
      : "default" === connection.name || !connection.name
        ? typeorm_1.EntityManager
        : `${connection.name}EntityManager`;
}
exports.getEntityManagerToken = getEntityManagerToken;
function handleRetry(source) {
  return source.pipe(
    operators_1.retryWhen(e =>
      e.pipe(
        operators_1.scan((errorCount, error) => {
          common_1.Logger.error(
            `Unable to connect to the database. Retrying (${errorCount +
              1})...`,
            "",
            "TypeOrmModule"
          );
          if (errorCount >= 10) {
            throw error;
          }
          return errorCount + 1;
        }, 0),
        operators_1.delay(3000)
      )
    )
  );
}
exports.handleRetry = handleRetry;
