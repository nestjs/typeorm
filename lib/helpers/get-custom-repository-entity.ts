import {
  AbstractRepository,
  getMetadataArgsStorage,
  Repository,
} from 'typeorm';
import { EntityClassOrSchema } from '../interfaces/entity-class-or-schema.type';

export function getCustomRepositoryEntity(
  entities: EntityClassOrSchema[],
): Array<EntityClassOrSchema> {
  const customRepositoryEntities = new Array<EntityClassOrSchema>();
  const typeormEntityRepositories = getMetadataArgsStorage().entityRepositories;

  for (const entity of entities) {
    const isCustomRepository =
      entity instanceof Function &&
      (entity.prototype instanceof Repository ||
        entity.prototype instanceof AbstractRepository);
    if (isCustomRepository) {
      const entityRepositoryMetadataArgs = typeormEntityRepositories.find(
        (repository) => {
          return (
            repository.target ===
            (entity instanceof Function ? entity : (entity as any)?.constructor)
          );
        },
      );
      if (entityRepositoryMetadataArgs) {
        const targetEntity = entityRepositoryMetadataArgs.entity as EntityClassOrSchema;
        const isEntityRegisteredAlready = entities.indexOf(targetEntity) !== -1;

        if (!isEntityRegisteredAlready) {
          customRepositoryEntities.push(targetEntity);
        }
      }
    }
  }
  return customRepositoryEntities;
}
