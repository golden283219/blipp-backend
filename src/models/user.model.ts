import {belongsTo, Entity, hasOne, model, property} from '@loopback/repository';
import {AuthorizationRoles} from '../types/jwt';
import {Restaurant} from './restaurant.model';
import {UserCredential} from './user-credential.model';

@model()
export class User extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id: number;

  @property({
    type: 'string',
    required: true,
  })
  email: string;

  @property({
    type: 'string',
    default: AuthorizationRoles.RESTAURANT,
  })
  role: string;

  @hasOne(() => UserCredential)
  userCredential: UserCredential;

  @belongsTo(() => Restaurant)
  restaurantId: number;

  constructor(data?: Partial<User>) {
    super(data);
  }
}

export interface UserRelations {
  // describe navigational properties here
}

export type UserWithRelations = User & UserRelations;
