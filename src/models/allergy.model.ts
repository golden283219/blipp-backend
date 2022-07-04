import {Entity, model, property} from '@loopback/repository';

@model()
export class Allergy extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'string',
  })
  name?: string;


  constructor(data?: Partial<Allergy>) {
    super(data);
  }
}

export interface AllergyRelations {
  // describe navigational properties here
}

export type AllergyWithRelations = Allergy & AllergyRelations;
