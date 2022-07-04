import {authenticate} from '@loopback/authentication';
import {authorize} from '@loopback/authorization';
import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, param} from '@loopback/rest';
import {Receipt, Restaurant} from '../models';
import {ReceiptRepository} from '../repositories';
import {AuthorizationRoles} from '../types/jwt';

@authenticate('jwt')
@authorize({
  allowedRoles: [AuthorizationRoles.ADMIN],
})
export class ReceiptRestaurantController {
  constructor(
    @repository(ReceiptRepository)
    public receiptRepository: ReceiptRepository,
  ) {}

  @get('/receipts/{id}/restaurant', {
    responses: {
      '200': {
        description: 'Restaurant belonging to Receipt',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Restaurant)},
          },
        },
      },
    },
  })
  async getRestaurant(
    @param.path.number('id') id: typeof Receipt.prototype.id,
  ): Promise<Restaurant> {
    return this.receiptRepository.restaurant(id);
  }
}
