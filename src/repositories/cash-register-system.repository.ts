import {DefaultCrudRepository, repository, HasManyRepositoryFactory} from '@loopback/repository';
import {CashRegisterSystem, CashRegisterSystemRelations, Order, Receipt} from '../models';
import {DbDataSource} from '../datasources';
import {inject, Getter} from '@loopback/core';
import {OrderRepository} from './order.repository';
import {ReceiptRepository} from './receipt.repository';

export class CashRegisterSystemRepository extends DefaultCrudRepository<
  CashRegisterSystem,
  typeof CashRegisterSystem.prototype.id,
  CashRegisterSystemRelations
> {

  public readonly orders: HasManyRepositoryFactory<Order, typeof CashRegisterSystem.prototype.id>;

  public readonly receipts: HasManyRepositoryFactory<Receipt, typeof CashRegisterSystem.prototype.id>;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource, @repository.getter('OrderRepository') protected orderRepositoryGetter: Getter<OrderRepository>, @repository.getter('ReceiptRepository') protected receiptRepositoryGetter: Getter<ReceiptRepository>,
  ) {
    super(CashRegisterSystem, dataSource);
    this.receipts = this.createHasManyRepositoryFactoryFor('receipts', receiptRepositoryGetter,);
    this.registerInclusionResolver('receipts', this.receipts.inclusionResolver);
    this.orders = this.createHasManyRepositoryFactoryFor('orders', orderRepositoryGetter,);
    this.registerInclusionResolver('orders', this.orders.inclusionResolver);
  }
}
