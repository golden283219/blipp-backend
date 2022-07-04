import {DefaultCrudRepository} from '@loopback/repository';
import {ItemVariantRelation, ItemVariantRelationRelations} from '../models';
import {DbDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class ItemVariantRelationRepository extends DefaultCrudRepository<
  ItemVariantRelation,
  typeof ItemVariantRelation.prototype.id,
  ItemVariantRelationRelations
> {
  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
  ) {
    super(ItemVariantRelation, dataSource);
  }
}
