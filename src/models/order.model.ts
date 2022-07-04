import {
  belongsTo,
  Entity,
  hasMany,
  hasOne,
  model,
  property
} from '@loopback/repository';
import {
  ActiveOrderStatuses,
  DeliveryType,
  OrderStatus,
  PaymentMethod
} from '../types';
import {Customer} from './customer.model';
import {OrderExtraInfo} from './order-extra-info.model';
import {OrderedItem} from './ordered-item.model';
import {PaymentInfo} from './payment-info.model';
import {Receipt} from './receipt.model';
import {Restaurant} from './restaurant.model';
import {Table} from './table.model';

@model({settings: {strict: true}})
export class Order extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id: number;

  @property({
    type: 'date',
    default: () => new Date(),
  })
  createdAt: string;

  @property({
    type: 'date',
  })
  expectedAt?: string;

  @property({
    type: 'boolean',
    default: false,
  })
  open: boolean;

  @property({
    type: 'string',
    default: DeliveryType.RESERVATION,
  })
  deliveryType: DeliveryType;

  @property({
    type: 'string',
    default: OrderStatus.NOT_ORDERED,
  })
  foodStatus: OrderStatus;

  @property({
    type: 'string',
    default: OrderStatus.NOT_ORDERED,
  })
  drinkStatus: OrderStatus;

  @property({
    type: 'string',
  })
  paymentMethod: PaymentMethod;

  @property({
    type: 'boolean',
    default: false,
  })
  isPaid: boolean;

  @belongsTo(() => Customer)
  customerId: number;

  @belongsTo(() => Restaurant)
  restaurantId: number;

  @hasMany(() => OrderedItem)
  orderedItems: OrderedItem[];

  @belongsTo(() => Table)
  tableId?: number;

  @property({
    type: OrderExtraInfo,
  })
  extraInfo?: OrderExtraInfo;

  @property({
    type: 'number',
  })
  cashRegisterSystemId?: number;

  @hasOne(() => PaymentInfo)
  paymentInfo: PaymentInfo;

  @hasOne(() => Receipt)
  receipt: Receipt;

  constructor(data?: Partial<Order>) {
    super(data);
  }

  isActive(): boolean {
    const foodIsActive = ActiveOrderStatuses.includes(this.foodStatus);
    const drinkIsActive = ActiveOrderStatuses.includes(this.drinkStatus);
    return foodIsActive || drinkIsActive;
  }
}

export interface OrderRelations {
  // describe navigational properties here
}

export type OrderWithRelations = Order & OrderRelations;
