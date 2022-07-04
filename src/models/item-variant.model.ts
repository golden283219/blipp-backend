import {Entity, hasMany, model, property} from '@loopback/repository';
import {ItemVariantRelation} from './item-variant-relation.model';
import {Item} from './item.model';
import {ItemVariantOption} from './item-variant-option.model';
import {ItemVariantOptionRelation} from './item-variant-option-relation.model';

@model()
export class ItemVariant extends Entity {
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
    type: 'boolean',
    default: true,
  })
  isMultiSelect?: boolean;

  @property({
    type: 'boolean',
    default: false,
  })
  isRequired?: boolean;

  @hasMany(() => Item, {through: {model: () => ItemVariantRelation}})
  items: Item[];

  @hasMany(() => ItemVariantOption, {through: {model: () => ItemVariantOptionRelation}})
  itemVariantOptions: ItemVariantOption[];

  constructor(data?: Partial<ItemVariant>) {
    super(data);
  }
}

export interface ItemVariantRelations {
  // describe navigational properties here
}

export type ItemVariantWithRelations = ItemVariant & ItemVariantRelations;
