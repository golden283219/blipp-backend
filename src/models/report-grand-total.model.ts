import {Model, model, property} from '@loopback/repository';

@model()
export class ReportGrandTotal extends Model {
  @property({
    type: 'number',
    required: true,
    postgresql: {
      dataType: 'NUMERIC',
    },
  })
  gross: number;

  @property({
    type: 'number',
    required: true,
    postgresql: {
      dataType: 'NUMERIC',
    },
  })
  grossReturned: number;

  constructor(data?: Partial<ReportGrandTotal>) {
    super(data);
  }
}

export interface ReportGrandTotalRelations {
  // describe navigational properties here
}

export type ReportGrandTotalWithRelations = ReportGrandTotal &
  ReportGrandTotalRelations;
