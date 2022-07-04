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
import {
  Restaurant,
  DeliveryCost,
} from '../models';
import {RestaurantRepository} from '../repositories';

export class RestaurantDeliveryCostController {
  constructor(
    @repository(RestaurantRepository) protected restaurantRepository: RestaurantRepository,
  ) { }

  @get('/restaurants/{id}/delivery-cost', {
    responses: {
      '200': {
        description: 'Restaurant has one DeliveryCost',
        content: {
          'application/json': {
            schema: getModelSchemaRef(DeliveryCost),
          },
        },
      },
    },
  })
  async get(
    @param.path.number('id') id: number,
    @param.query.object('filter') filter?: Filter<DeliveryCost>,
  ): Promise<DeliveryCost> {
    return this.restaurantRepository.deliveryCost(id).get(filter);
  }

  @post('/restaurants/{id}/delivery-cost', {
    responses: {
      '200': {
        description: 'Restaurant model instance',
        content: {'application/json': {schema: getModelSchemaRef(DeliveryCost)}},
      },
    },
  })
  async create(
    @param.path.number('id') id: typeof Restaurant.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(DeliveryCost, {
            title: 'NewDeliveryCostInRestaurant',
            exclude: ['id'],
            optional: ['restaurantId']
          }),
        },
      },
    }) deliveryCost: Omit<DeliveryCost, 'id'>,
  ): Promise<DeliveryCost> {
    return this.restaurantRepository.deliveryCost(id).create(deliveryCost);
  }

  @patch('/restaurants/{id}/delivery-cost', {
    responses: {
      '200': {
        description: 'Restaurant.DeliveryCost PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(DeliveryCost, {partial: true}),
        },
      },
    })
    deliveryCost: Partial<DeliveryCost>,
    @param.query.object('where', getWhereSchemaFor(DeliveryCost)) where?: Where<DeliveryCost>,
  ): Promise<Count> {
    return this.restaurantRepository.deliveryCost(id).patch(deliveryCost, where);
  }

  @del('/restaurants/{id}/delivery-cost', {
    responses: {
      '200': {
        description: 'Restaurant.DeliveryCost DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(DeliveryCost)) where?: Where<DeliveryCost>,
  ): Promise<Count> {
    return this.restaurantRepository.deliveryCost(id).delete(where);
  }
}
