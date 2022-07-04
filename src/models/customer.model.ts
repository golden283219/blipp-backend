import {Entity, hasMany, model, property} from '@loopback/repository';
import {Order} from './order.model';
import {Receipt} from './receipt.model';

@model()
export class Customer extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id: number;

  @property({
    type: 'string',
  })
  firstName: string;

  @property({
    type: 'string',
  })
  lastName: string;

  @property({
    type: 'string',
  })
  messengerId: string;

  @property({
    type: 'string',
    format: 'email',
  })
  email: string;

  @hasMany(() => Order)
  orders: Order[];

  @hasMany(() => Receipt)
  receipts: Receipt[];

  constructor(data?: Partial<Customer>) {
    super(data);
  }
}

export interface CustomerRelations {
  // describe navigational properties here
}

export type CustomerWithRelations = Customer & CustomerRelations;
