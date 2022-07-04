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
  ChatfuelCredentials,
} from '../models';
import {RestaurantRepository} from '../repositories';

export class RestaurantChatfuelCredentialsController {
  constructor(
    @repository(RestaurantRepository) protected restaurantRepository: RestaurantRepository,
  ) { }

  @get('/restaurants/{id}/chatfuel-credentials', {
    responses: {
      '200': {
        description: 'Restaurant has one ChatfuelCredentials',
        content: {
          'application/json': {
            schema: getModelSchemaRef(ChatfuelCredentials),
          },
        },
      },
    },
  })
  async get(
    @param.path.number('id') id: number,
    @param.query.object('filter') filter?: Filter<ChatfuelCredentials>,
  ): Promise<ChatfuelCredentials> {
    return this.restaurantRepository.chatfuelCredentials(id).get(filter);
  }

  @post('/restaurants/{id}/chatfuel-credentials', {
    responses: {
      '200': {
        description: 'Restaurant model instance',
        content: {'application/json': {schema: getModelSchemaRef(ChatfuelCredentials)}},
      },
    },
  })
  async create(
    @param.path.number('id') id: typeof Restaurant.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ChatfuelCredentials, {
            title: 'NewChatfuelCredentialsInRestaurant',
            exclude: ['id'],
            optional: ['restaurantId']
          }),
        },
      },
    }) chatfuelCredentials: Omit<ChatfuelCredentials, 'id'>,
  ): Promise<ChatfuelCredentials> {
    return this.restaurantRepository.chatfuelCredentials(id).create(chatfuelCredentials);
  }

  @patch('/restaurants/{id}/chatfuel-credentials', {
    responses: {
      '200': {
        description: 'Restaurant.ChatfuelCredentials PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ChatfuelCredentials, {partial: true}),
        },
      },
    })
    chatfuelCredentials: Partial<ChatfuelCredentials>,
    @param.query.object('where', getWhereSchemaFor(ChatfuelCredentials)) where?: Where<ChatfuelCredentials>,
  ): Promise<Count> {
    return this.restaurantRepository.chatfuelCredentials(id).patch(chatfuelCredentials, where);
  }

  @del('/restaurants/{id}/chatfuel-credentials', {
    responses: {
      '200': {
        description: 'Restaurant.ChatfuelCredentials DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(ChatfuelCredentials)) where?: Where<ChatfuelCredentials>,
  ): Promise<Count> {
    return this.restaurantRepository.chatfuelCredentials(id).delete(where);
  }
}
