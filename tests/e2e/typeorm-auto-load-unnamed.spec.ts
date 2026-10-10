import { INestApplication, Module } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import {
  Column,
  DataSource,
  DataSourceOptions,
  Entity,
  PrimaryGeneratedColumn,
  Repository,
} from 'typeorm';
import { getRepositoryToken, TypeOrmModule } from '../../lib';

@Entity('auto_loaded_note')
class AutoLoadedNote {
  @PrimaryGeneratedColumn() id!: number;

  @Column() text!: string;
}

const unnamedOptions: DataSourceOptions = {
  type: 'postgres',
  host: '0.0.0.0',
  port: 3306,
  username: 'root',
  password: 'root',
  database: 'test',
};

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...unnamedOptions,
      synchronize: true,
      autoLoadEntities: true,
      retryAttempts: 2,
      retryDelay: 1000,
    }),
    TypeOrmModule.forFeature([AutoLoadedNote], unnamedOptions),
  ],
})
class AutoLoadUnnamedModule {}

describe('TypeOrm (autoLoadEntities with an unnamed data source reference)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [AutoLoadUnnamedModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('auto-loads entities registered with unnamed options into the default DataSource', () => {
    expect(app.get(DataSource).hasMetadata(AutoLoadedNote)).toBe(true);
  });

  it('injects a working repository for the auto-loaded entity', async () => {
    const repository = app.get<Repository<AutoLoadedNote>>(
      getRepositoryToken(AutoLoadedNote),
    );

    const saved = await repository.save({ text: 'hello' });

    expect(await repository.findOneBy({ id: saved.id })).toMatchObject({
      text: 'hello',
    });
  });
});
