import {Model, model, property} from '@loopback/repository';

@model()
export class ReportOpenOrder extends Model {
  @property({
    type: 'string',
    required: true,
  })
  tableName: string;

  @property({
    type: 'number',
    required: true,
  })
  total: number;


  constructor(data?: Partial<ReportOpenOrder>) {
    super(data);
  }
}

export interface ReportOpenOrderRelations {
  // describe navigational properties here
}

export type ReportOpenOrderWithRelations = ReportOpenOrder & ReportOpenOrderRelations;
