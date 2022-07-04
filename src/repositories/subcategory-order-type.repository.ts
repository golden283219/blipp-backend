import {DefaultCrudRepository} from '@loopback/repository';
import {SubcategoryOrderType, SubcategoryOrderTypeRelations} from '../models';
import {DbDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class SubcategoryOrderTypeRepository extends DefaultCrudRepository<
  SubcategoryOrderType,
  typeof SubcategoryOrderType.prototype.id,
  SubcategoryOrderTypeRelations
> {
  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
  ) {
    super(SubcategoryOrderType, dataSource);
  }
}
