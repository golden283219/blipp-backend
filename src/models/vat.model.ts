import {Model, model, property} from '@loopback/repository';

@model()
export class Vat extends Model {
  @property({
    type: 'number',
    required: true,
  })
  vat: number;

  @property({
    type: 'number',
    required: true,
    postgresql: {
      dataType: 'NUMERIC',
    },
  })
  gross: number;

  constructor(data?: Partial<Vat>) {
    super(data);
  }
}

export interface ReportVatRelations {
  // describe navigational properties here
}

export type ReportVatWithRelations = Vat & ReportVatRelations;
