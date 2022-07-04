import {Entity, model, property, hasMany} from '@loopback/repository';
import {Item} from './item.model';
import {ItemOrderType} from './item-order-type.model';
import {ItemSubcategory} from './item-subcategory.model';
import {SubcategoryOrderType} from './subcategory-order-type.model';

@model()
export class OrderType extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'string',
  })
  name?: string;

  @hasMany(() => Item, {through: {model: () => ItemOrderType}})
  items: Item[];

  @hasMany(() => ItemSubcategory, {through: {model: () => SubcategoryOrderType}})
  itemSubcategories: ItemSubcategory[];

  constructor(data?: Partial<OrderType>) {
    super(data);
  }
}

export interface OrderTypeRelations {
  // describe navigational properties here
}

export type OrderTypeWithRelations = OrderType & OrderTypeRelations;
