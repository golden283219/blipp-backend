import {Model, model, property} from '@loopback/repository';

@model()
export class ActiveAllergy extends Model {
  @property({
    type: 'number',
  })
  id?: number;

  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'boolean',
    required: true,
  })
  removable: boolean;


  constructor(data?: Partial<ActiveAllergy>) {
    super(data);
  }
}

export interface ActiveAllergyRelations {
  // describe navigational properties here
}

export type ActiveAllergyWithRelations = ActiveAllergy & ActiveAllergyRelations;
