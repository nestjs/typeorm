import { Connection, ConnectionOptions } from 'typeorm';
import { Observable } from 'rxjs/Observable';
export declare function getRepositoryToken(entity: Function): string;
export declare function getConnectionToken(connection?: Connection | ConnectionOptions | string): string | Function;
export declare function getEntityManagerToken(connection?: Connection | ConnectionOptions | string): string | Function;
export declare function handleRetry<T>(source: Observable<T>): Observable<T>;
