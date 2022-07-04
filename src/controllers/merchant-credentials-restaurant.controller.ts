import {authenticate} from '@loopback/authentication';
import {authorize} from '@loopback/authorization';
import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, param} from '@loopback/rest';
import {MerchantCredentials, Restaurant} from '../models';
import {MerchantCredentialsRepository} from '../repositories';
import {AuthorizationRoles} from '../types/jwt';

@authenticate('jwt')
@authorize({
  allowedRoles: [AuthorizationRoles.ADMIN],
})
export class MerchantCredentialsRestaurantController {
  constructor(
    @repository(MerchantCredentialsRepository)
    public merchantCredentialsRepository: MerchantCredentialsRepository,
  ) {}

  @get('/merchant-credentials/{id}/restaurant', {
    responses: {
      '200': {
        description: 'Restaurant belonging to MerchantCredentials',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Restaurant)},
          },
        },
      },
    },
  })
  async getRestaurant(
    @param.path.number('id') id: typeof MerchantCredentials.prototype.id,
  ): Promise<Restaurant> {
    return this.merchantCredentialsRepository.restaurant(id);
  }
}
