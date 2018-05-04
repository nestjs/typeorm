import { Repository } from "typeorm";

export abstract class EntitySubscriberAbstract {
    /**
     * @description Constructor
     *
     * @param {Repository<any>} repository The repository where the Subscriber will be injected
     */
    protected constructor(repository: Repository<any>) {
        Object.assign(
            repository.manager.connection,
            {
                subscribers: [].concat(...repository.manager.connection.subscribers).concat([this]),
            }
        );
    }
}
