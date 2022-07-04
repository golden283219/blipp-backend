import {Getter, inject} from '@loopback/core';
import {
  BelongsToAccessor,
  DefaultCrudRepository,
  HasManyRepositoryFactory,
  repository, HasManyThroughRepositoryFactory} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {
  Item,
  ItemSubcategory,
  ItemSubcategoryRelations,
  Restaurant, OrderType, SubcategoryOrderType} from '../models';
import {ItemRepository} from './item.repository';
import {RestaurantRepository} from './restaurant.repository';
import {SubcategoryOrderTypeRepository} from './subcategory-order-type.repository';
import {OrderTypeRepository} from './order-type.repository';

export class ItemSubcategoryRepository extends DefaultCrudRepository<
  ItemSubcategory,
  typeof ItemSubcategory.prototype.id,
  ItemSubcategoryRelations
> {
  public readonly items: HasManyRepositoryFactory<
    Item,
    typeof ItemSubcategory.prototype.id
  >;

  public readonly restaurant: BelongsToAccessor<
    Restaurant,
    typeof ItemSubcategory.prototype.id
  >;

  public readonly upSellItems: HasManyRepositoryFactory<
    Item,
    typeof ItemSubcategory.prototype.id
  >;

  public readonly orderTypes: HasManyThroughRepositoryFactory<OrderType, typeof OrderType.prototype.id,
          SubcategoryOrderType,
          typeof ItemSubcategory.prototype.id
        >;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
    @repository.getter('ItemRepository')
    protected itemRepositoryGetter: Getter<ItemRepository>,
    @repository.getter('RestaurantRepository')
    protected restaurantRepositoryGetter: Getter<RestaurantRepository>, @repository.getter('SubcategoryOrderTypeRepository') protected subcategoryOrderTypeRepositoryGetter: Getter<SubcategoryOrderTypeRepository>, @repository.getter('OrderTypeRepository') protected orderTypeRepositoryGetter: Getter<OrderTypeRepository>,
  ) {
    super(ItemSubcategory, dataSource);
    this.orderTypes = this.createHasManyThroughRepositoryFactoryFor('orderTypes', orderTypeRepositoryGetter, subcategoryOrderTypeRepositoryGetter,);
    this.registerInclusionResolver('orderTypes', this.orderTypes.inclusionResolver);
    this.restaurant = this.createBelongsToAccessorFor(
      'restaurant',
      restaurantRepositoryGetter,
    );
    this.registerInclusionResolver(
      'restaurant',
      this.restaurant.inclusionResolver,
    );
    this.items = this.createHasManyRepositoryFactoryFor(
      'items',
      itemRepositoryGetter,
    );
    this.registerInclusionResolver('items', this.items.inclusionResolver);
  }
}
