import {DefaultCrudRepository, repository, BelongsToAccessor, HasManyRepositoryFactory, HasOneRepositoryFactory} from '@loopback/repository';
import {Order, OrderRelations, Customer, Restaurant, OrderedItem, Table, PaymentInfo, Receipt} from '../models';
import {DbDataSource} from '../datasources';
import {inject, Getter} from '@loopback/core';
import {CustomerRepository} from './customer.repository';
import {RestaurantRepository} from './restaurant.repository';
import {OrderedItemRepository} from './ordered-item.repository';
import {TableRepository} from './table.repository';
import {PaymentInfoRepository} from './payment-info.repository';
import {ReceiptRepository} from './receipt.repository';

export class OrderRepository extends DefaultCrudRepository<
  Order,
  typeof Order.prototype.id,
  OrderRelations
> {

  public readonly customer: BelongsToAccessor<Customer, typeof Order.prototype.id>;

  public readonly restaurant: BelongsToAccessor<Restaurant, typeof Order.prototype.id>;

  public readonly orderedItems: HasManyRepositoryFactory<OrderedItem, typeof Order.prototype.id>;

  public readonly table: BelongsToAccessor<Table, typeof Order.prototype.id>;

  public readonly paymentInfo: HasOneRepositoryFactory<PaymentInfo, typeof Order.prototype.id>;

  public readonly receipt: HasOneRepositoryFactory<Receipt, typeof Order.prototype.id>;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource, @repository.getter('CustomerRepository') protected customerRepositoryGetter: Getter<CustomerRepository>, @repository.getter('RestaurantRepository') protected restaurantRepositoryGetter: Getter<RestaurantRepository>, @repository.getter('OrderedItemRepository') protected orderedItemRepositoryGetter: Getter<OrderedItemRepository>, @repository.getter('TableRepository') protected tableRepositoryGetter: Getter<TableRepository>, @repository.getter('PaymentInfoRepository') protected paymentInfoRepositoryGetter: Getter<PaymentInfoRepository>, @repository.getter('ReceiptRepository') protected receiptRepositoryGetter: Getter<ReceiptRepository>,
  ) {
    super(Order, dataSource);
    this.receipt = this.createHasOneRepositoryFactoryFor('receipt', receiptRepositoryGetter);
    this.registerInclusionResolver('receipt', this.receipt.inclusionResolver);
    this.paymentInfo = this.createHasOneRepositoryFactoryFor('paymentInfo', paymentInfoRepositoryGetter);
    this.registerInclusionResolver('paymentInfo', this.paymentInfo.inclusionResolver);
    this.table = this.createBelongsToAccessorFor('table', tableRepositoryGetter,);
    this.registerInclusionResolver('table', this.table.inclusionResolver);
    this.orderedItems = this.createHasManyRepositoryFactoryFor('orderedItems', orderedItemRepositoryGetter,);
    this.registerInclusionResolver('orderedItems', this.orderedItems.inclusionResolver);
    this.restaurant = this.createBelongsToAccessorFor('restaurant', restaurantRepositoryGetter,);
    this.registerInclusionResolver('restaurant', this.restaurant.inclusionResolver);
    this.customer = this.createBelongsToAccessorFor('customer', customerRepositoryGetter,);
    this.registerInclusionResolver('customer', this.customer.inclusionResolver);
  }
}
