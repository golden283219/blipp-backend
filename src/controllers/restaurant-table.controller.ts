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
import {Restaurant, Table} from '../models';
import {RestaurantRepository} from '../repositories';
import {AuthorizationRoles} from '../types/jwt';

@authenticate('jwt')
@authorize({
  allowedRoles: [AuthorizationRoles.ADMIN],
})
export class RestaurantTableController {
  constructor(
    @repository(RestaurantRepository)
    protected restaurantRepository: RestaurantRepository,
  ) {}

  @get('/restaurants/{id}/tables', {
    responses: {
      '200': {
        description: 'Array of Restaurant has many Table',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Table)},
          },
        },
      },
    },
  })
  async find(
    @param.path.number('id') id: number,
    @param.query.object('filter') filter?: Filter<Table>,
  ): Promise<Table[]> {
    return this.restaurantRepository.tables(id).find(filter);
  }

  @post('/restaurants/{id}/tables', {
    responses: {
      '200': {
        description: 'Restaurant model instance',
        content: {'application/json': {schema: getModelSchemaRef(Table)}},
      },
    },
  })
  async create(
    @param.path.number('id') id: typeof Restaurant.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Table, {
            title: 'NewTableInRestaurant',
            exclude: ['id'],
            optional: ['restaurantId'],
          }),
        },
      },
    })
    table: Omit<Table, 'id'>,
  ): Promise<Table> {
    return this.restaurantRepository.tables(id).create(table);
  }

  @patch('/restaurants/{id}/tables', {
    responses: {
      '200': {
        description: 'Restaurant.Table PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Table, {partial: true}),
        },
      },
    })
    table: Partial<Table>,
    @param.query.object('where', getWhereSchemaFor(Table)) where?: Where<Table>,
  ): Promise<Count> {
    return this.restaurantRepository.tables(id).patch(table, where);
  }

  @del('/restaurants/{id}/tables', {
    responses: {
      '200': {
        description: 'Restaurant.Table DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(Table)) where?: Where<Table>,
  ): Promise<Count> {
    return this.restaurantRepository.tables(id).delete(where);
  }
}
