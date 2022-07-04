import {belongsTo, Entity, model, property} from '@loopback/repository';
import {Item} from './item.model';
import {Order} from './order.model';

@model()
export class OrderedItem extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'number',
    default: 1,
  })
  quantity: number;

  @property({
    type: 'string',
  })
  specialRequest?: string;

  @property({
    type: 'boolean',
    default: false,
  })
  isDone: boolean;

  @property.array(Number)
  variantOptionsIds: number[];

  @property.array(Number)
  allergyIds: number[];

  @belongsTo(() => Order)
  orderId: number;

  @property({type: 'number'})
  productGroupId: number;

  @belongsTo(() => Item)
  itemId: number;

  constructor(data?: Partial<OrderedItem>) {
    super(data);
  }
}

export interface OrderedItemRelations {
  // describe navigational properties here
}

export type OrderedItemWithRelations = OrderedItem & OrderedItemRelations;
