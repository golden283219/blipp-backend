import {Getter, inject} from '@loopback/core';
import {
  BelongsToAccessor,
  DefaultCrudRepository,
  repository, HasManyThroughRepositoryFactory} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {
  ItemVariant,
  ItemVariantOption,
  ItemVariantOptionRelations, ItemVariantOptionRelation} from '../models';
import {ItemVariantRepository} from './item-variant.repository';
import {ItemVariantOptionRelationRepository} from './item-variant-option-relation.repository';

export class ItemVariantOptionRepository extends DefaultCrudRepository<
  ItemVariantOption,
  typeof ItemVariantOption.prototype.id,
  ItemVariantOptionRelations
> {
  public readonly itemVariant: BelongsToAccessor<
    ItemVariant,
    typeof ItemVariantOption.prototype.id
  >;

  public readonly itemVariants: HasManyThroughRepositoryFactory<ItemVariant, typeof ItemVariant.prototype.id,
          ItemVariantOptionRelation,
          typeof ItemVariantOption.prototype.id
        >;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
    @repository.getter('ItemVariantRepository')
    protected itemVariantRepositoryGetter: Getter<ItemVariantRepository>, @repository.getter('ItemVariantOptionRelationRepository') protected itemVariantOptionRelationRepositoryGetter: Getter<ItemVariantOptionRelationRepository>,
  ) {
    super(ItemVariantOption, dataSource);
    this.itemVariants = this.createHasManyThroughRepositoryFactoryFor('itemVariants', itemVariantRepositoryGetter, itemVariantOptionRelationRepositoryGetter,);
    this.registerInclusionResolver('itemVariants', this.itemVariants.inclusionResolver);
  }
}
