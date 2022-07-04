import {
  belongsTo,
  Entity,
  hasMany,
  model,
  property
} from '@loopback/repository';
import {ItemCategory} from '../types';
import {Item} from './item.model';
import {Restaurant} from './restaurant.model';
import {OrderType} from './order-type.model';
import {SubcategoryOrderType} from './subcategory-order-type.model';

@model()
export class ItemSubcategory extends Entity {
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
    default: ItemCategory.FOOD,
  })
  category: ItemCategory;

  @property({
    type: 'number',
    default: -1
  })
  parentSubcategoryId: number;

  @property.array(Number)
  subCategoryIds: number[]

  @hasMany(() => Item)
  items: Item[];


  // @hasMany(() => ItemSubcategory)
  @hasMany(() => OrderType, {through: {model: () => SubcategoryOrderType}})
  orderTypes: OrderType[];
  // subCategories: ItemSubcategory[];

  @belongsTo(() => Restaurant)
  restaurantId: number;

  constructor(data?: Partial<ItemSubcategory>) {
    super(data);
  }
}

export interface ItemSubcategoryRelations {
  // describe navigational properties here
}

export type ItemSubcategoryWithRelations = ItemSubcategory &
  ItemSubcategoryRelations;
