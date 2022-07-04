import {authenticate} from '@loopback/authentication';
import {authorize} from '@loopback/authorization';
import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  getWhereSchemaFor,
  param,
  patch,
  post,
  requestBody,
} from '@loopback/rest';
import {Report, Restaurant} from '../models';
import {RestaurantRepository} from '../repositories';
import {AuthorizationRoles} from '../types/jwt';

@authenticate('jwt')
@authorize({
  allowedRoles: [AuthorizationRoles.ADMIN],
})
export class RestaurantReportController {
  constructor(
    @repository(RestaurantRepository)
    protected restaurantRepository: RestaurantRepository,
  ) {}

  @get('/restaurants/{id}/reports', {
    responses: {
      '200': {
        description: 'Array of Restaurant has many Report',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Report)},
          },
        },
      },
    },
  })
  async find(
    @param.path.number('id') id: number,
    @param.query.object('filter') filter?: Filter<Report>,
  ): Promise<Report[]> {
    return this.restaurantRepository.reports(id).find(filter);
  }

  @post('/restaurants/{id}/reports', {
    responses: {
      '200': {
        description: 'Restaurant model instance',
        content: {'application/json': {schema: getModelSchemaRef(Report)}},
      },
    },
  })
  async create(
    @param.path.number('id') id: typeof Restaurant.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Report, {
            title: 'NewReportInRestaurant',
            exclude: ['id'],
            optional: ['restaurantId'],
          }),
        },
      },
    })
    report: Omit<Report, 'id'>,
  ): Promise<Report> {
    return this.restaurantRepository.reports(id).create(report);
  }

  @patch('/restaurants/{id}/reports', {
    responses: {
      '200': {
        description: 'Restaurant.Report PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Report, {partial: true}),
        },
      },
    })
    report: Partial<Report>,
    @param.query.object('where', getWhereSchemaFor(Report))
    where?: Where<Report>,
  ): Promise<Count> {
    return this.restaurantRepository.reports(id).patch(report, where);
  }

  @del('/restaurants/{id}/reports', {
    responses: {
      '200': {
        description: 'Restaurant.Report DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(Report))
    where?: Where<Report>,
  ): Promise<Count> {
    return this.restaurantRepository.reports(id).delete(where);
  }
}
