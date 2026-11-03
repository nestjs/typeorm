import { Module } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DataSource, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { getDataSourceToken, TypeOrmModule } from '../../lib';
import { DataSourceNameRegistry } from '../../lib/data-source-name.registry';

@Entity()
class ExplicitEntity {
  @PrimaryGeneratedColumn()
  id: number;
}

@Entity()
class FeatureEntity {
  @PrimaryGeneratedColumn()
  id: number;
}

@Module({
  imports: [TypeOrmModule.forFeature([FeatureEntity], 'auto-load-spec')],
})
class FeatureModule {}

describe('autoLoadEntities', () => {
  beforeEach(() => {
    DataSourceNameRegistry.clear();
  });

  it.each([
    { case: 'an array', entities: [ExplicitEntity] },
    { case: 'an object map', entities: { ExplicitEntity } },
  ])(
    'keeps entities passed as $case and adds forFeature() entities',
    async ({ entities }) => {
      const moduleRef = await Test.createTestingModule({
        imports: [
          TypeOrmModule.forRoot({
            name: 'auto-load-spec',
            type: 'postgres',
            host: '0.0.0.0',
            port: 3306,
            username: 'root',
            password: 'root',
            database: 'test',
            manualInitialization: true,
            autoLoadEntities: true,
            entities,
          }),
          FeatureModule,
        ],
      }).compile();

      const dataSource = moduleRef.get<DataSource>(
        getDataSourceToken('auto-load-spec'),
      );
      expect(dataSource.options.entities).toEqual(
        expect.arrayContaining([ExplicitEntity, FeatureEntity]),
      );

      await moduleRef.close();
    },
  );
});
