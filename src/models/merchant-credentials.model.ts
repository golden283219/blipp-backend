import {belongsTo, Entity, model, property} from '@loopback/repository';
import {Restaurant} from './restaurant.model';

@model()
export class MerchantCredentials extends Entity {
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
  merchantId: string;

  @property({
    type: 'string',
    required: true,
  })
  merchantName: string;

  @property({
    type: 'string',
    required: true,
  })
  token: string;

  @belongsTo(() => Restaurant)
  restaurantId: number;

  constructor(data?: Partial<MerchantCredentials>) {
    super(data);
  }
}

export interface MerchantCredentialsRelations {
  // describe navigational properties here
}

export type MerchantCredentialsWithRelations = MerchantCredentials &
  MerchantCredentialsRelations;
