import {belongsTo, Entity, hasMany, model, property} from '@loopback/repository';
import {Order} from './order.model';
import {Restaurant} from './restaurant.model';

@model()
export class Table extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'boolean',
    default: false,
  })
  occupied?: boolean;

  @property({
    type: 'boolean',
    default: false,
  })
  needsService?: boolean;

  @property({
    type: 'date',
  })
  lastServiceCall?: string;

  @property({
    type: 'string',
  })
  name?: string;

  @property({
    type: 'number',
    default: 0,
  })
  positionX?: number;

  @property({
    type: 'number',
    default: 0,
  })
  positionY?: number;

  @belongsTo(() => Restaurant)
  restaurantId: number;

  @hasMany(() => Order)
  orders: Order[];

  constructor(data?: Partial<Table>) {
    super(data);
  }
}

export interface TableRelations {
  // describe navigational properties here
}

export type TableWithRelations = Table & TableRelations;
