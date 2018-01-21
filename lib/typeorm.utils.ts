import { Connection, ConnectionOptions, EntityManager } from 'typeorm';

export function getRepositoryToken(entity: Function) {
  return `${entity.name}Repository`;
}

/**
 * This function returns a Connection injection token for the given Connection, ConnectionOptions or connection name.
 * @param {Connection | ConnectionOptions | string} [connection='default'] This optional parameter is either
 * a Connection, or a ConnectionOptions or a string.
 * @returns {string | Function} The Connection injection token.
 */
export function getConnectionToken(connection: Connection|ConnectionOptions|string = 'default'): string|Function {
  return 'default' === connection ? Connection
    : 'string' === typeof connection ? `${connection}Connection`
    : 'default' === connection.name || !connection.name ? Connection
    : `${connection.name}Connection`;
}

/**
 * This function returns an EntityManager injection token for the given Connection, ConnectionOptions or connection name.
 * @param {Connection | ConnectionOptions | string} [connection='default'] This optional parameter is either
 * a Connection, or a ConnectionOptions or a string.
 * @returns {string | Function} The EntityManager injection token.
 */
export function getEntityManagerToken(connection: Connection|ConnectionOptions|string = 'default'): string|Function {
  return 'default' === connection ? EntityManager
    : 'string' === typeof connection ? `${connection}EntityManager`
      : 'default' === connection.name || !connection.name ? EntityManager
        : `${connection.name}EntityManager`;
}