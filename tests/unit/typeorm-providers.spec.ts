import 'reflect-metadata';
import {
  Column,
  DataSource,
  Entity,
  EntitySchema,
  PrimaryGeneratedColumn,
  Repository,
  Tree,
  TreeChildren,
  TreeParent,
  TreeRepository,
} from 'typeorm';
import { createTypeOrmProviders } from '../../lib/typeorm.providers';

@Entity()
@Tree('materialized-path')
class Folder {
  @PrimaryGeneratedColumn()
  id: number;

  @TreeParent()
  parent: Folder;

  @TreeChildren()
  children: Folder[];
}

@Entity()
class File {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
}

interface Category {
  id: number;
  name: string;
  parent?: Category;
  children?: Category[];
}

const CategorySchema = new EntitySchema<Category>({
  name: 'Category',
  columns: {
    id: { type: Number, primary: true, generated: true },
    name: { type: String },
  },
  relations: {
    parent: { type: 'many-to-one', target: 'Category', treeParent: true },
    children: { type: 'one-to-many', target: 'Category', treeChildren: true },
  },
  trees: [{ type: 'materialized-path' }],
});

describe('createTypeOrmProviders', () => {
  let dataSource: DataSource;

  beforeAll(async () => {
    dataSource = new DataSource({
      type: 'postgres',
      entities: [Folder, File, CategorySchema],
    });
    // Builds entity metadata without connecting to the database.
    await (dataSource as any).buildMetadatas();
  });

  function createRepository(entity: Function | EntitySchema) {
    const [provider] = createTypeOrmProviders([entity]) as any[];
    return provider.useFactory(dataSource);
  }

  it('should create a tree repository for a tree entity class', () => {
    expect(createRepository(Folder)).toBeInstanceOf(TreeRepository);
  });

  it('should create a tree repository for a tree entity schema', () => {
    expect(createRepository(CategorySchema)).toBeInstanceOf(TreeRepository);
  });

  it('should create a regular repository for a non-tree entity', () => {
    const repository = createRepository(File);
    expect(repository).toBeInstanceOf(Repository);
    expect(repository).not.toBeInstanceOf(TreeRepository);
  });
});
