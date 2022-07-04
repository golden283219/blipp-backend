import {DefaultCrudRepository, repository, HasManyThroughRepositoryFactory} from '@loopback/repository';
import {OrderType, OrderTypeRelations, Item, ItemOrderType, ItemSubcategory, SubcategoryOrderType} from '../models';
import {DbDataSource} from '../datasources';
import {inject, Getter} from '@loopback/core';
import {ItemOrderTypeRepository} from './item-order-type.repository';
import {ItemRepository} from './item.repository';
import {SubcategoryOrderTypeRepository} from './subcategory-order-type.repository';
import {ItemSubcategoryRepository} from './item-subcategory.repository';

export class OrderTypeRepository extends DefaultCrudRepository<
  OrderType,
  typeof OrderType.prototype.id,
  OrderTypeRelations
> {

  public readonly items: HasManyThroughRepositoryFactory<Item, typeof Item.prototype.id,
          ItemOrderType,
          typeof OrderType.prototype.id
        >;

  public readonly itemSubcategories: HasManyThroughRepositoryFactory<ItemSubcategory, typeof ItemSubcategory.prototype.id,
          SubcategoryOrderType,
          typeof OrderType.prototype.id
        >;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource, @repository.getter('ItemOrderTypeRepository') protected itemOrderTypeRepositoryGetter: Getter<ItemOrderTypeRepository>, @repository.getter('ItemRepository') protected itemRepositoryGetter: Getter<ItemRepository>, @repository.getter('SubcategoryOrderTypeRepository') protected subcategoryOrderTypeRepositoryGetter: Getter<SubcategoryOrderTypeRepository>, @repository.getter('ItemSubcategoryRepository') protected itemSubcategoryRepositoryGetter: Getter<ItemSubcategoryRepository>,
  ) {
    super(OrderType, dataSource);
    this.itemSubcategories = this.createHasManyThroughRepositoryFactoryFor('itemSubcategories', itemSubcategoryRepositoryGetter, subcategoryOrderTypeRepositoryGetter,);
    this.registerInclusionResolver('itemSubcategories', this.itemSubcategories.inclusionResolver);
    this.items = this.createHasManyThroughRepositoryFactoryFor('items', itemRepositoryGetter, itemOrderTypeRepositoryGetter,);
    this.registerInclusionResolver('items', this.items.inclusionResolver);
  }
}
