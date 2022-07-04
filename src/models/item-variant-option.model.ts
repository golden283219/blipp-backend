import {Entity, model, property, hasMany} from '@loopback/repository';
import {ItemVariant} from './item-variant.model';
import {ItemVariantOptionRelation} from './item-variant-option-relation.model';

@model()
export class ItemVariantOption extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'number',
    default: 0,
  })
  price: number;

  @hasMany(() => ItemVariant, {through: {model: () => ItemVariantOptionRelation}})
  itemVariants: ItemVariant[];

  constructor(data?: Partial<ItemVariantOption>) {
    super(data);
  }
}

export interface ItemVariantOptionRelations {
  // describe navigational properties here
}

export type ItemVariantOptionWithRelations = ItemVariantOption &
  ItemVariantOptionRelations;
