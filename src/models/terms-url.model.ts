import {Entity, model, property} from '@loopback/repository';

@model()
export class TermsUrl extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'string',
    required: true,
  })
  url: string;

  @property({
    type: 'number',
  })
  restaurantId?: number;

  constructor(data?: Partial<TermsUrl>) {
    super(data);
  }
}

export interface TermsUrlRelations {
  // describe navigational properties here
}

export type TermsUrlWithRelations = TermsUrl & TermsUrlRelations;
