import {Getter, inject} from '@loopback/core';
import {
  DefaultCrudRepository,
  HasManyThroughRepositoryFactory,
  repository,
} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {
  Item,
  ItemVariant,
  ItemVariantRelation,
  ItemVariantRelations, ItemVariantOption, ItemVariantOptionRelation} from '../models';
import {ItemVariantOptionRepository} from './item-variant-option.repository';
import {ItemVariantRelationRepository} from './item-variant-relation.repository';
import {ItemRepository} from './item.repository';
import {ItemVariantOptionRelationRepository} from './item-variant-option-relation.repository';

export class ItemVariantRepository extends DefaultCrudRepository<
  ItemVariant,
  typeof ItemVariant.prototype.id,
  ItemVariantRelations
> {
  public readonly items: HasManyThroughRepositoryFactory<
    Item,
    typeof Item.prototype.id,
    ItemVariantRelation,
    typeof ItemVariant.prototype.id
  >;

  public readonly itemVariantOptions: HasManyThroughRepositoryFactory<ItemVariantOption, typeof ItemVariantOption.prototype.id,
          ItemVariantOptionRelation,
          typeof ItemVariant.prototype.id
        >;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
    @repository.getter('ItemVariantOptionRepository')
    protected itemVariantOptionRepositoryGetter: Getter<ItemVariantOptionRepository>,
    @repository.getter('ItemRepository')
    protected itemRepositoryGetter: Getter<ItemRepository>,
    @repository.getter('ItemVariantRelationRepository')
    protected itemVariantRelationRepositoryGetter: Getter<ItemVariantRelationRepository>, @repository.getter('ItemVariantOptionRelationRepository') protected itemVariantOptionRelationRepositoryGetter: Getter<ItemVariantOptionRelationRepository>,
  ) {
    super(ItemVariant, dataSource);
    this.itemVariantOptions = this.createHasManyThroughRepositoryFactoryFor('itemVariantOptions', itemVariantOptionRepositoryGetter, itemVariantOptionRelationRepositoryGetter,);
    this.registerInclusionResolver('itemVariantOptions', this.itemVariantOptions.inclusionResolver);
    this.items = this.createHasManyThroughRepositoryFactoryFor(
      'items',
      itemRepositoryGetter,
      itemVariantRelationRepositoryGetter,
    );
    this.registerInclusionResolver('items', this.items.inclusionResolver);
  }
}
