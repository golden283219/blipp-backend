import {Model, model, property} from '@loopback/repository';

@model()
export class ReportReturnedReceipts extends Model {
  @property({
    type: 'string',
    required: true,
  })
  paymentMethod: string;

  @property({
    type: 'number',
    required: true,
  })
  total: number;


  constructor(data?: Partial<ReportReturnedReceipts>) {
    super(data);
  }
}

export interface ReportReturnedReceiptsRelations {
  // describe navigational properties here
}

export type ReportReturnedReceiptsWithRelations = ReportReturnedReceipts & ReportReturnedReceiptsRelations;
