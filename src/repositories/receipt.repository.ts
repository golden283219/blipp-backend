import {Getter, inject} from '@loopback/core';
import {
  BelongsToAccessor,
  DefaultCrudRepository,
  repository,
} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Customer, Receipt, ReceiptRelations, Restaurant} from '../models';
import {CustomerRepository} from './customer.repository';
import {RestaurantRepository} from './restaurant.repository';

export class ReceiptRepository extends DefaultCrudRepository<
  Receipt,
  typeof Receipt.prototype.id,
  ReceiptRelations
> {
  public readonly restaurant: BelongsToAccessor<
    Restaurant,
    typeof Receipt.prototype.id
  >;

  public readonly customer: BelongsToAccessor<
    Customer,
    typeof Receipt.prototype.id
  >;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
    @repository.getter('RestaurantRepository')
    protected restaurantRepositoryGetter: Getter<RestaurantRepository>,
    @repository.getter('CustomerRepository')
    protected customerRepositoryGetter: Getter<CustomerRepository>,
  ) {
    super(Receipt, dataSource);
    this.customer = this.createBelongsToAccessorFor(
      'customer',
      customerRepositoryGetter,
    );
    this.registerInclusionResolver('customer', this.customer.inclusionResolver);
    this.restaurant = this.createBelongsToAccessorFor(
      'restaurant',
      restaurantRepositoryGetter,
    );
    this.registerInclusionResolver(
      'restaurant',
      this.restaurant.inclusionResolver,
    );
  }
}
