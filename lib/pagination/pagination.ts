import {Repository, FindManyOptions, ObjectLiteral} from 'typeorm';
import PaginationInterface from './pagination.interface';

export default async (
  repository: Repository<ObjectLiteral>,
  options: FindManyOptions<ObjectLiteral> = { take: 10, skip: 0 },
): Promise<PaginationInterface> => {
  if (options.skip >= 1) options.skip--;
  options.skip = options.skip * options.take;

  const [results, total] = await repository.findAndCount(options);

  return {
    items: results,
    count: results.length,
    total,
    pages: Math.ceil(total / options.take),
  };
};
