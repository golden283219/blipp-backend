import {Getter, inject} from '@loopback/core';
import {
  BelongsToAccessor,
  DefaultCrudRepository,
  HasManyRepositoryFactory,
  HasManyThroughRepositoryFactory,
  HasOneRepositoryFactory,
  repository,
} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {
  Item,
  ItemOrderType,
  ItemRelations,
  ItemSubcategory,
  OrderedItem,
  OrderType,
  ProductGroup,
  Restaurant, ItemVariant, ItemVariantRelation} from '../models';
import {ItemOrderTypeRepository} from './item-order-type.repository';
import {ItemSubcategoryRepository} from './item-subcategory.repository';
import {ItemVariantRepository} from './item-variant.repository';
import {OrderTypeRepository} from './order-type.repository';
import {OrderedItemRepository} from './ordered-item.repository';
import {ProductGroupRepository} from './product-group.repository';
import {RestaurantRepository} from './restaurant.repository';
import {ItemVariantRelationRepository} from './item-variant-relation.repository';

export class ItemRepository extends DefaultCrudRepository<
  Item,
  typeof Item.prototype.id,
  ItemRelations
> {
  public readonly itemSubcategory: HasOneRepositoryFactory<
    ItemSubcategory,
    typeof Item.prototype.id
  >;

  public readonly restaurant: BelongsToAccessor<
    Restaurant,
    typeof Item.prototype.id
  >;

  public readonly orderedItems: HasManyRepositoryFactory<
    OrderedItem,
    typeof Item.prototype.id
  >;

  public readonly productGroup: BelongsToAccessor<
    ProductGroup,
    typeof Item.prototype.id
  >;

  public readonly orderTypes: HasManyThroughRepositoryFactory<
    OrderType,
    typeof OrderType.prototype.id,
    ItemOrderType,
    typeof Item.prototype.id
  >;

  public readonly itemVariants: HasManyThroughRepositoryFactory<ItemVariant, typeof ItemVariant.prototype.id,
          ItemVariantRelation,
          typeof Item.prototype.id
        >;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
    @repository.getter('ItemSubcategoryRepository')
    protected itemSubcategoryRepositoryGetter: Getter<ItemSubcategoryRepository>,
    @repository.getter('RestaurantRepository')
    protected restaurantRepositoryGetter: Getter<RestaurantRepository>,
    @repository.getter('OrderedItemRepository')
    protected orderedItemRepositoryGetter: Getter<OrderedItemRepository>,
    @repository.getter('ItemVariantRepository')
    protected itemVariantRepositoryGetter: Getter<ItemVariantRepository>,
    @repository.getter('ProductGroupRepository')
    protected productGroupRepositoryGetter: Getter<ProductGroupRepository>,
    @repository.getter('ItemOrderTypeRepository')
    protected itemOrderTypeRepositoryGetter: Getter<ItemOrderTypeRepository>,
    @repository.getter('OrderTypeRepository')
    protected orderTypeRepositoryGetter: Getter<OrderTypeRepository>, @repository.getter('ItemVariantRelationRepository') protected itemVariantRelationRepositoryGetter: Getter<ItemVariantRelationRepository>,
  ) {
    super(Item, dataSource);
    this.itemVariants = this.createHasManyThroughRepositoryFactoryFor('itemVariants', itemVariantRepositoryGetter, itemVariantRelationRepositoryGetter,);
    this.registerInclusionResolver('itemVariants', this.itemVariants.inclusionResolver);
    this.orderTypes = this.createHasManyThroughRepositoryFactoryFor(
      'orderTypes',
      orderTypeRepositoryGetter,
      itemOrderTypeRepositoryGetter,
    );
    this.registerInclusionResolver(
      'orderTypes',
      this.orderTypes.inclusionResolver,
    );
    this.productGroup = this.createBelongsToAccessorFor(
      'productGroup',
      productGroupRepositoryGetter,
    );
    this.registerInclusionResolver(
      'productGroup',
      this.productGroup.inclusionResolver,
    );
    this.orderedItems = this.createHasManyRepositoryFactoryFor(
      'orderedItems',
      orderedItemRepositoryGetter,
    );
    this.registerInclusionResolver(
      'orderedItems',
      this.orderedItems.inclusionResolver,
    );
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
