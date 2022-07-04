import {DefaultCrudRepository} from '@loopback/repository';
import {PaymentInfo, PaymentInfoRelations} from '../models';
import {DbDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class PaymentInfoRepository extends DefaultCrudRepository<
  PaymentInfo,
  typeof PaymentInfo.prototype.id,
  PaymentInfoRelations
> {
  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
  ) {
    super(PaymentInfo, dataSource);
  }
}
