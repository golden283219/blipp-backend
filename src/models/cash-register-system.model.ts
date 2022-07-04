import {Entity, model, property, hasMany} from '@loopback/repository';
import {Order} from './order.model';
import {Receipt} from './receipt.model';

@model()
export class CashRegisterSystem extends Entity {
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
  unitId: number;

  @property({
    type: 'number',
  })
  restaurantId?: number;

  @hasMany(() => Order)
  orders: Order[];

  @hasMany(() => Receipt)
  receipts: Receipt[];

  constructor(data?: Partial<CashRegisterSystem>) {
    super(data);
  }
}

export interface CashRegisterSystemRelations {
  // describe navigational properties here
}

export type CashRegisterSystemWithRelations = CashRegisterSystem & CashRegisterSystemRelations;
