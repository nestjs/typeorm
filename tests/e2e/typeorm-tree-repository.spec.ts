import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import {
  Column,
  Entity,
  EntitySchema,
  PrimaryGeneratedColumn,
  Repository,
  Tree,
  TreeChildren,
  TreeParent,
  TreeRepository,
} from 'typeorm';
import { getRepositoryToken, TypeOrmModule } from '../../lib';

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

class Tag {
  id: number;
  name: string;
  parent?: Tag;
  children?: Tag[];
}

const TagSchema = new EntitySchema<Tag>({
  name: 'Tag',
  target: Tag,
  columns: {
    id: { type: Number, primary: true, generated: true },
    name: { type: String },
  },
  relations: {
    parent: { type: 'many-to-one', target: 'Tag', treeParent: true },
    children: { type: 'one-to-many', target: 'Tag', treeChildren: true },
  },
  trees: [{ type: 'materialized-path' }],
});

describe('TypeOrm (tree repositories)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: '0.0.0.0',
          port: 3306,
          username: 'root',
          password: 'root',
          database: 'test',
          synchronize: true,
          autoLoadEntities: true,
          retryAttempts: 2,
          retryDelay: 1000,
        }),
        TypeOrmModule.forFeature([Folder, File, CategorySchema, TagSchema]),
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('should inject a tree repository for a tree entity class', () => {
    expect(app.get(getRepositoryToken(Folder))).toBeInstanceOf(TreeRepository);
  });

  it('should inject a tree repository for a tree entity schema', async () => {
    const repository = app.get<TreeRepository<Category>>(
      getRepositoryToken(CategorySchema),
    );
    expect(repository).toBeInstanceOf(TreeRepository);
    await expect(repository.findTrees()).resolves.toEqual([]);
  });

  it('should inject a tree repository for a tree entity schema with a target class', async () => {
    const repository = app.get<TreeRepository<Tag>>(
      getRepositoryToken(TagSchema),
    );
    expect(repository).toBeInstanceOf(TreeRepository);
    await expect(repository.findTrees()).resolves.toEqual([]);
  });

  it('should inject a regular repository for a non-tree entity', () => {
    const repository = app.get(getRepositoryToken(File));
    expect(repository).toBeInstanceOf(Repository);
    expect(repository).not.toBeInstanceOf(TreeRepository);
  });
});
