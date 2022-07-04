import {Model, model, property} from '@loopback/repository';

@model()
export class OrderExtraInfo extends Model {
  @property({
    type: 'string',
  })
  address?: string;

  @property({
    type: 'string',
  })
  zipCode?: string;

  @property({
    type: 'string',
  })
  orderTime?: string;

  @property({
    type: 'string',
  })
  phoneNumber?: string;


  constructor(data?: Partial<OrderExtraInfo>) {
    super(data);
  }
}

export interface OrderExtraInfoRelations {
  // describe navigational properties here
}

export type OrderExtraInfoWithRelations = OrderExtraInfo & OrderExtraInfoRelations;
