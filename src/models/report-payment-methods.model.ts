import {Model, model, property} from '@loopback/repository';

@model()
export class ReportPaymentMethods extends Model {
  @property({
    type: 'string',
  })
  paymentMethod?: string;

  @property({
    type: 'number',
  })
  orders?: number;

  @property({
    type: 'number',
    postgresql: {
      dataType: 'NUMERIC',
    },
  })
  total?: number;

  constructor(data?: Partial<ReportPaymentMethods>) {
    super(data);
  }
}

export interface ReportPaymentMethodsRelations {
  // describe navigational properties here
}

export type ReportPaymentMethodsWithRelations = ReportPaymentMethods &
  ReportPaymentMethodsRelations;
