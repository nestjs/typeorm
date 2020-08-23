import {EntityClassOrSchema} from "./interfaces/entity-class-or-schema.type";
import {AbstractRepository, getMetadataArgsStorage, Repository} from "typeorm";


export function getCustomRepositoryEntity(entities: EntityClassOrSchema[]): Array<EntityClassOrSchema> {
    let customRepositoryEntities = new Array<EntityClassOrSchema>();
    for (let entity of entities) {
        if (
            entity instanceof Function &&
            (entity.prototype instanceof Repository ||
                entity.prototype instanceof AbstractRepository)
        ) {
            const entityRepositoryMetadataArgs = getMetadataArgsStorage().entityRepositories.find(
                (repository) => {
                    return (
                        repository.target ===
                        (entity instanceof Function
                            ? entity
                            : (entity as any).constructor)
                    );
                },
            );
            if (entityRepositoryMetadataArgs) {
                if (
                    entities.indexOf(<EntityClassOrSchema>entityRepositoryMetadataArgs.entity) === -1
                ) {
                    customRepositoryEntities.push(<EntityClassOrSchema>entityRepositoryMetadataArgs.entity);
                }
            }
        }
    }
    return customRepositoryEntities;
}
