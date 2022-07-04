import {Model, model, property} from '@loopback/repository';

@model()
export class ReceiptCurrency extends Model {
  @property({
    type: 'string',
    required: true,
  })
  locale: string;

  @property({
    type: 'string',
    required: true,
  })
  currency: string;

  constructor(data?: Partial<ReceiptCurrency>) {
    super(data);
  }
}

export interface ReceiptCurrencyRelations {
  // describe navigational properties here
}

export type ReceiptCurrencyWithRelations = ReceiptCurrency &
  ReceiptCurrencyRelations;
