import {Entity, model, property} from '@loopback/repository';

@model()
export class ItemOrderType extends Entity {
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
  orderTypeId?: number;

  constructor(data?: Partial<ItemOrderType>) {
    super(data);
  }
}

export interface ItemOrderTypeRelations {
  // describe navigational properties here
}

export type ItemOrderTypeWithRelations = ItemOrderType & ItemOrderTypeRelations;
