import {Entity, hasMany, model, property} from '@loopback/repository';
import {Item} from './item.model';

@model()
export class ProductGroup extends Entity {
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
    required: true,
  })
  vat: number;

  @property({
    type: 'number',
  })
  accountPlan: number;

  @property({
    type: 'number',
  })
  vatAccount: number;

  @property({
    type: 'boolean',
  })
  credit: boolean;

  @property({
    type: 'boolean',
    default: false,
  })
  isTakeaway: boolean;

  @property({
    type: 'boolean',
    default: false,
  })
  isDelivery: boolean;

  @hasMany(() => Item)
  items: Item[];

  @property({
    type: 'number',
  })
  restaurantId: number;

  constructor(data?: Partial<ProductGroup>) {
    super(data);
  }
}

export interface ProductGroupRelations {
  // describe navigational properties here
}

export type ProductGroupWithRelations = ProductGroup & ProductGroupRelations;
