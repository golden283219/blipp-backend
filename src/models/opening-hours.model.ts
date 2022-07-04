import {Model, model, property} from '@loopback/repository';
import {OpeningHoursDefault} from '../types';

@model()
export class OpeningHours extends Model {
  @property({
    type: 'number',
  })
  day?: number;

  @property({
    type: 'string',
    default: OpeningHoursDefault.OPENING_HOUR,
  })
  openingHour: string;

  @property({
    type: 'string',
    default: OpeningHoursDefault.CLOSING_HOUR,
  })
  closingHour: string;

  constructor(data?: Partial<OpeningHours>) {
    super(data);
  }
}

export interface OpeningHoursRelations {
  // describe navigational properties here
}

export type OpeningHoursWithRelations = OpeningHours & OpeningHoursRelations;
