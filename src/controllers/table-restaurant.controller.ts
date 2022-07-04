import {authenticate} from '@loopback/authentication';
import {authorize} from '@loopback/authorization';
import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, param} from '@loopback/rest';
import {Restaurant, Table} from '../models';
import {TableRepository} from '../repositories';
import {AuthorizationRoles} from '../types/jwt';

@authenticate('jwt')
@authorize({
  allowedRoles: [AuthorizationRoles.ADMIN],
})
export class TableRestaurantController {
  constructor(
    @repository(TableRepository)
    public tableRepository: TableRepository,
  ) {}

  @get('/tables/{id}/restaurant', {
    responses: {
      '200': {
        description: 'Restaurant belonging to Table',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Restaurant)},
          },
        },
      },
    },
  })
  async getRestaurant(
    @param.path.number('id') id: typeof Table.prototype.id,
  ): Promise<Restaurant> {
    return this.tableRepository.restaurant(id);
  }
}
