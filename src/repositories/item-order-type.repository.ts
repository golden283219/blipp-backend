import {DefaultCrudRepository} from '@loopback/repository';
import {ItemOrderType, ItemOrderTypeRelations} from '../models';
import {DbDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class ItemOrderTypeRepository extends DefaultCrudRepository<
  ItemOrderType,
  typeof ItemOrderType.prototype.id,
  ItemOrderTypeRelations
> {
  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
  ) {
    super(ItemOrderType, dataSource);
  }
}
