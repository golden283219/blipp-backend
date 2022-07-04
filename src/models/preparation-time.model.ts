import {Model, model, property} from '@loopback/repository';

@model()
export class PreparationTime extends Model {
  @property({
    type: 'string',
  })
  deliveryType?: string;

  @property({
    type: 'number',
    default: 30,
  })
  time?: number;

  constructor(data?: Partial<PreparationTime>) {
    super(data);
  }
}

export interface PreparationTimeRelations {
  // describe navigational properties here
}

export type PreparationTimeWithRelations = PreparationTime & PreparationTimeRelations;
