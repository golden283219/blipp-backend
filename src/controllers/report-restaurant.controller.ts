import {authenticate} from '@loopback/authentication';
import {authorize} from '@loopback/authorization';
import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, param} from '@loopback/rest';
import {Report, Restaurant} from '../models';
import {ReportRepository} from '../repositories';
import {AuthorizationRoles} from '../types/jwt';

@authenticate('jwt')
@authorize({
  allowedRoles: [AuthorizationRoles.ADMIN],
})
export class ReportRestaurantController {
  constructor(
    @repository(ReportRepository)
    public reportRepository: ReportRepository,
  ) {}

  @get('/reports/{id}/restaurant', {
    responses: {
      '200': {
        description: 'Restaurant belonging to Report',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Restaurant)},
          },
        },
      },
    },
  })
  async getRestaurant(
    @param.path.number('id') id: typeof Report.prototype.id,
  ): Promise<Restaurant> {
    return this.reportRepository.restaurant(id);
  }
}
