import {authenticate} from '@loopback/authentication';
import {authorize} from '@loopback/authorization';
import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, param} from '@loopback/rest';
import {Currency, Restaurant} from '../models';
import {RestaurantRepository} from '../repositories';
import {AuthorizationRoles} from '../types/jwt';

@authenticate('jwt')
@authorize({
  allowedRoles: [AuthorizationRoles.ADMIN],
})
export class RestaurantCurrencyController {
  constructor(
    @repository(RestaurantRepository)
    public restaurantRepository: RestaurantRepository,
  ) {}

  @get('/restaurants/{id}/currency', {
    responses: {
      '200': {
        description: 'Currency belonging to Restaurant',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Currency)},
          },
        },
      },
    },
  })
  async getCurrency(
    @param.path.number('id') id: typeof Restaurant.prototype.id,
  ): Promise<Currency> {
    return this.restaurantRepository.currency(id);
  }
}
