import {Entity, model, property} from '@loopback/repository';

@model()
export class ItemVariantRelation extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'number',
  })
  itemId?: number;

  @property({
    type: 'number',
  })
  itemVariantId?: number;

  constructor(data?: Partial<ItemVariantRelation>) {
    super(data);
  }
}

export interface ItemVariantRelationRelations {
  // describe navigational properties here
}

export type ItemVariantRelationWithRelations = ItemVariantRelation & ItemVariantRelationRelations;
