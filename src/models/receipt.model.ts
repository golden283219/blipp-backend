import {belongsTo, Entity, model, property} from '@loopback/repository';
import {DeliveryType, PaymentMethod} from '../types';
import {Customer} from './customer.model';
import {ReceiptCurrency} from './receipt-currency.model';
import {ReceiptItem} from './receipt-item.model';
import {Restaurant} from './restaurant.model';
import {Vat} from './vat.model';

@model()
export class Receipt extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id: number;

  @property({
    type: 'string',
  })
  sn: string;

  @property({
    type: 'string',
  })
  ka: string;

  @property({
    type: 'date',
    default: () => new Date(),
  })
  date: string;

  @property({
    type: 'boolean',
    default: false,
  })
  isReturned: boolean;

  @property({
    type: 'boolean',
    default: false,
  })
  isReturnReceipt: boolean;

  @property({
    type: 'string',
  })
  restaurantName: string;

  @property({
    type: 'string',
  })
  restaurantPhoneNumber: string;

  @property({
    type: 'string',
  })
  address: string;

  @property({
    type: 'string',
  })
  orgnr: string;

  @property({
    type: 'string',
  })
  deliveryType?: DeliveryType;

  @property({
    type: 'string',
  })
  tableName?: string;

  @property({
    type: 'string',
  })
  customerName?: string;

  @property({
    type: 'number',
    postgresql: {
      dataType: 'NUMERIC(7,2)',
    },
  })
  total: number;

  @property({
    type: 'number',
    postgresql: {
      dataType: 'NUMERIC(7,2)',
    },
  })
  rounding: number;

  @property({
    type: 'string',
  })
  paymentMethod: PaymentMethod;

  @property({
    type: 'string',
  })
  cardType: string;

  @property({
    type: 'string',
  })
  cardNumber: string;

  @property({
    type: 'boolean',
    default: true,
  })
  allowedToCopy: boolean;

  @property({
    type: 'string',
  })
  deliveryCostInfo: string;

  @property.array(ReceiptItem)
  items: ReceiptItem[];

  @belongsTo(() => Restaurant)
  restaurantId: number;

  @property.array(Vat)
  receiptVat: Vat[];

  @belongsTo(() => Customer)
  customerId: number;

  @property({
    type: 'number',
  })
  cashRegisterSystemId?: number;

  @property({
    type: 'number',
  })
  orderId: number;

  @property({type: ReceiptCurrency})
  receiptCurrency: ReceiptCurrency;

  constructor(data?: Partial<Receipt>) {
    super(data);
  }
}

export interface ReceiptRelations {
  // describe navigational properties here
}

export type ReceiptWithRelations = Receipt & ReceiptRelations;
