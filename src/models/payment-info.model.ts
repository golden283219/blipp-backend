import {Entity, model, property} from '@loopback/repository';

@model()
export class PaymentInfo extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'string',
  })
  payeeId?: string;

  @property({
    type: 'string',
    required: true,
  })
  payeeReference: string;

  @property({
    type: 'string',
    required: true,
  })
  payeeName: string;

  @property({
    type: 'string',
    required: true,
  })
  type: string;

  @property({
    type: 'number',
    required: true,
  })
  amount: number;

  @property({
    type: 'number',
    required: true,
  })
  vatAmount: number;

  @property({
    type: 'string',
    required: true,
  })
  paymentId: string;

  @property({
    type: 'number',
    required: true,
  })
  orderId: number;

  constructor(data?: Partial<PaymentInfo>) {
    super(data);
  }
}

export interface PaymentInfoRelations {
  // describe navigational properties here
}

export type PaymentInfoWithRelations = PaymentInfo & PaymentInfoRelations;
