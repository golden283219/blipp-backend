import {Getter, inject} from '@loopback/core';
import {BelongsToAccessor, DefaultCrudRepository, repository} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Order, OrderedItem, OrderedItemRelations, Item} from '../models';
import {ItemRepository} from './item.repository';
import {OrderRepository} from './order.repository';

export class OrderedItemRepository extends DefaultCrudRepository<
  OrderedItem,
  typeof OrderedItem.prototype.id,
  OrderedItemRelations
  > {

  public readonly order: BelongsToAccessor<Order, typeof OrderedItem.prototype.id>;

  public readonly item: BelongsToAccessor<Item, typeof OrderedItem.prototype.id>;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource, @repository.getter('OrderRepository') protected orderRepositoryGetter: Getter<OrderRepository>, @repository.getter('ItemRepository') protected itemRepositoryGetter: Getter<ItemRepository>,
  ) {
    super(OrderedItem, dataSource);
    this.item = this.createBelongsToAccessorFor('item', itemRepositoryGetter,);
    this.registerInclusionResolver('item', this.item.inclusionResolver);
    this.order = this.createBelongsToAccessorFor('order', orderRepositoryGetter,);
    this.registerInclusionResolver('order', this.order.inclusionResolver);
  }
}
