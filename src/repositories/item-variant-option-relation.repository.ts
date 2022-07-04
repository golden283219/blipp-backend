import {DefaultCrudRepository} from '@loopback/repository';
import {ItemVariantOptionRelation, ItemVariantOptionRelationRelations} from '../models';
import {DbDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class ItemVariantOptionRelationRepository extends DefaultCrudRepository<
  ItemVariantOptionRelation,
  typeof ItemVariantOptionRelation.prototype.id,
  ItemVariantOptionRelationRelations
> {
  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
  ) {
    super(ItemVariantOptionRelation, dataSource);
  }
}
