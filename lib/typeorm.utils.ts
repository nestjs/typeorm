import { Connection, ConnectionOptions } from 'typeorm';

export function getRepositoryToken(entity: Function) {
  return `${entity.name}Repository`;
}

/**
 * This function returns a injection token for the given Connection, ConnectionOptions or connection name.
 * @param {Connection | ConnectionOptions | string} [connection='default'] This optional parameter is either
 * a Connection, or a ConnectionOptions or a string.
 * @returns {string | Function} The Connection injection token.
 */
export function getConnectionToken(connection: Connection|ConnectionOptions|string = 'default'): string|Function {
  return 'string' === typeof connection ? `${connection}Connection`
    : 'default' === connection.name ? Connection
    : `${connection.name}Connection`;
}