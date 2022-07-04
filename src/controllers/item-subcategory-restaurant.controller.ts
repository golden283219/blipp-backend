import {authenticate} from '@loopback/authentication';
import {authorize} from '@loopback/authorization';
import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, param} from '@loopback/rest';
import {ItemSubcategory, Restaurant} from '../models';
import {ItemSubcategoryRepository} from '../repositories';
import {AuthorizationRoles} from '../types/jwt';

@authenticate('jwt')
@authorize({
  allowedRoles: [AuthorizationRoles.ADMIN],
})
export class ItemSubcategoryRestaurantController {
  constructor(
    @repository(ItemSubcategoryRepository)
    public itemSubcategoryRepository: ItemSubcategoryRepository,
  ) {}

  @get('/item-subcategories/{id}/restaurant', {
    responses: {
      '200': {
        description: 'Restaurant belonging to ItemSubcategory',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Restaurant)},
          },
        },
      },
    },
  })
  async getRestaurant(
    @param.path.number('id') id: typeof ItemSubcategory.prototype.id,
  ): Promise<Restaurant> {
    return this.itemSubcategoryRepository.restaurant(id);
  }
}
