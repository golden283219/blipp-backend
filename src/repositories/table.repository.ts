import {DefaultCrudRepository, repository, BelongsToAccessor, HasManyRepositoryFactory} from '@loopback/repository';
import {Table, TableRelations, Restaurant, Order} from '../models';
import {DbDataSource} from '../datasources';
import {inject, Getter} from '@loopback/core';
import {RestaurantRepository} from './restaurant.repository';
import {OrderRepository} from './order.repository';

export class TableRepository extends DefaultCrudRepository<
  Table,
  typeof Table.prototype.id,
  TableRelations
> {

  public readonly restaurant: BelongsToAccessor<Restaurant, typeof Table.prototype.id>;

  public readonly orders: HasManyRepositoryFactory<Order, typeof Table.prototype.id>;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource, @repository.getter('RestaurantRepository') protected restaurantRepositoryGetter: Getter<RestaurantRepository>, @repository.getter('OrderRepository') protected orderRepositoryGetter: Getter<OrderRepository>,
  ) {
    super(Table, dataSource);
    this.orders = this.createHasManyRepositoryFactoryFor('orders', orderRepositoryGetter,);
    this.registerInclusionResolver('orders', this.orders.inclusionResolver);
    this.restaurant = this.createBelongsToAccessorFor('restaurant', restaurantRepositoryGetter,);
    this.registerInclusionResolver('restaurant', this.restaurant.inclusionResolver);
  }
}
