import { EntityManager, EntityTarget, FindOptionsWhere } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

export class DatabaseService {
  constructor(private readonly dbManager: EntityManager) {}

  async findOne<Entity>(
    entity: EntityTarget<Entity>,
    fieldName: string,
    fieldValue: string | number | boolean,
  ) {
    try {
      const whereCondition = {
        [fieldName]: fieldValue,
      };
      const item = await this.dbManager.findOne(entity, {
        where: whereCondition as FindOptionsWhere<Entity>,
      });
      return item;
    } catch (error) {
      throw error;
    }
  }

  async updateOne<Entity>(
    entity: EntityTarget<Entity>,
    id: number,
    data: unknown,
  ) {
    try {
      await this.dbManager.update(
        entity,
        id,
        data as QueryDeepPartialEntity<Entity>,
      );
      const savedRecord = await this.dbManager.findOne(entity, {
        where: {
          id: id,
        } as unknown as FindOptionsWhere<Entity>,
      });
      return savedRecord;
    } catch (error) {
      throw error;
    }
  }
}
