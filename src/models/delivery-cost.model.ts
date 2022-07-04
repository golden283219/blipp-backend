import {Entity, model, property} from '@loopback/repository';

@model()
export class DeliveryCost extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'number',
    required: true,
  })
  cost: number;

  @property({
    type: 'number',
    required: true,
  })
  productGroupId: number;

  @property({
    type: 'number',
  })
  restaurantId?: number;

  constructor(data?: Partial<DeliveryCost>) {
    super(data);
  }
}

export interface DeliveryCostRelations {
  // describe navigational properties here
}

export type DeliveryCostWithRelations = DeliveryCost & DeliveryCostRelations;
