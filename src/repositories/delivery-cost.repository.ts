import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {DeliveryCost, DeliveryCostRelations} from '../models';

export class DeliveryCostRepository extends DefaultCrudRepository<
  DeliveryCost,
  typeof DeliveryCost.prototype.id,
  DeliveryCostRelations
> {
  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
  ) {
    super(DeliveryCost, dataSource);
  }
}
