import {
  belongsTo,
  Entity,
  hasMany,
  model,
  property,
} from '@loopback/repository';
import {ItemOrderType} from './item-order-type.model';
import {OrderType} from './order-type.model';
import {OrderedItem} from './ordered-item.model';
import {ProductGroup} from './product-group.model';
import {Restaurant} from './restaurant.model';
import {ItemVariant} from './item-variant.model';
import {ItemVariantRelation} from './item-variant-relation.model';

@model()
export class Item extends Entity {
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
    type: 'string',
  })
  description?: string;

  @property({
    type: 'string',
  })
  diet?: string;

  @property({
    type: 'number',
    default: 0,
    postgresql: {
      dataType: 'NUMERIC(7,2)',
    },
  })
  price: number;

  @property({
    type: 'number',
  })
  spicy: number;

  @belongsTo(() => Restaurant)
  restaurantId: number;

  @property({
    type: 'number',
  })
  itemSubcategoryId?: number;

  @property({
    type: 'string',
  })
  imageUrl?: string;

  @hasMany(() => OrderedItem)
  orderedItems: OrderedItem[];

  @property.array(Number)
  upSellIds: number[];

  @property.array(Number)
  allergyIds: number[];

  @property.array(Number)
  removableAllergyIds: number[];

  @belongsTo(() => ProductGroup)
  productGroupId: number;

  @hasMany(() => OrderType, {through: {model: () => ItemOrderType}})
  orderTypes: OrderType[];

  @hasMany(() => ItemVariant, {through: {model: () => ItemVariantRelation}})
  itemVariants: ItemVariant[];

  constructor(data?: Partial<Item>) {
    super(data);
  }
}

export interface ItemRelations {
  // describe navigational properties here
}

export type ItemWithRelations = Item & ItemRelations;
