import {Entity, model, property} from '@loopback/repository';

@model()
export class ItemVariantOptionRelation extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'number',
  })
  itemVariantId?: number;

  @property({
    type: 'number',
  })
  itemVariantOptionId?: number;

  constructor(data?: Partial<ItemVariantOptionRelation>) {
    super(data);
  }
}

export interface ItemVariantOptionRelationRelations {
  // describe navigational properties here
}

export type ItemVariantOptionRelationWithRelations = ItemVariantOptionRelation & ItemVariantOptionRelationRelations;
