import {Model, model, property} from '@loopback/repository';

@model()
export class ReportProductGroup extends Model {
  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'number',
    required: true,
  })
  vat: number;

  @property({
    type: 'number',
    required: true,
  })
  vatAccout: number;

  @property({
    type: 'number',
    required: true,
  })
  accountPlan: number;

  @property({
    type: 'boolean',
    required: true,
  })
  credit: boolean;

  @property({
    type: 'number',
    postgresql: {
      dataType: 'NUMERIC',
    },
  })
  total: number;

  @property({
    type: 'number',
    required: true,
  })
  items: number;

  constructor(data?: Partial<ReportProductGroup>) {
    super(data);
  }
}

export interface ReportProductGroupRelations {
  // describe navigational properties here
}

export type ReportProductGroupWithRelations = ReportProductGroup &
  ReportProductGroupRelations;
