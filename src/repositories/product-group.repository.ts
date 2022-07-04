import {DefaultCrudRepository, repository, HasManyRepositoryFactory} from '@loopback/repository';
import {ProductGroup, ProductGroupRelations, Item} from '../models';
import {DbDataSource} from '../datasources';
import {inject, Getter} from '@loopback/core';
import {ItemRepository} from './item.repository';

export class ProductGroupRepository extends DefaultCrudRepository<
  ProductGroup,
  typeof ProductGroup.prototype.id,
  ProductGroupRelations
> {

  public readonly items: HasManyRepositoryFactory<Item, typeof ProductGroup.prototype.id>;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource, @repository.getter('ItemRepository') protected itemRepositoryGetter: Getter<ItemRepository>,
  ) {
    super(ProductGroup, dataSource);
    this.items = this.createHasManyRepositoryFactoryFor('items', itemRepositoryGetter,);
    this.registerInclusionResolver('items', this.items.inclusionResolver);
  }
}
