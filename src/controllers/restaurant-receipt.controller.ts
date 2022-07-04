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
import {Receipt, Restaurant} from '../models';
import {RestaurantRepository} from '../repositories';
import {AuthorizationRoles} from '../types/jwt';

@authenticate('jwt')
@authorize({
  allowedRoles: [AuthorizationRoles.ADMIN],
})
export class RestaurantReceiptController {
  constructor(
    @repository(RestaurantRepository)
    protected restaurantRepository: RestaurantRepository,
  ) {}

  @get('/restaurants/{id}/receipts', {
    responses: {
      '200': {
        description: 'Array of Restaurant has many Receipt',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Receipt)},
          },
        },
      },
    },
  })
  async find(
    @param.path.number('id') id: number,
    @param.query.object('filter') filter?: Filter<Receipt>,
  ): Promise<Receipt[]> {
    return this.restaurantRepository.receipts(id).find(filter);
  }

  @post('/restaurants/{id}/receipts', {
    responses: {
      '200': {
        description: 'Restaurant model instance',
        content: {'application/json': {schema: getModelSchemaRef(Receipt)}},
      },
    },
  })
  async create(
    @param.path.number('id') id: typeof Restaurant.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Receipt, {
            title: 'NewReceiptInRestaurant',
            exclude: ['id'],
            optional: ['restaurantId'],
          }),
        },
      },
    })
    receipt: Omit<Receipt, 'id'>,
  ): Promise<Receipt> {
    return this.restaurantRepository.receipts(id).create(receipt);
  }

  @patch('/restaurants/{id}/receipts', {
    responses: {
      '200': {
        description: 'Restaurant.Receipt PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Receipt, {partial: true}),
        },
      },
    })
    receipt: Partial<Receipt>,
    @param.query.object('where', getWhereSchemaFor(Receipt))
    where?: Where<Receipt>,
  ): Promise<Count> {
    return this.restaurantRepository.receipts(id).patch(receipt, where);
  }

  @del('/restaurants/{id}/receipts', {
    responses: {
      '200': {
        description: 'Restaurant.Receipt DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(Receipt))
    where?: Where<Receipt>,
  ): Promise<Count> {
    return this.restaurantRepository.receipts(id).delete(where);
  }
}
