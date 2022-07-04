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
  TermsUrl,
} from '../models';
import {RestaurantRepository} from '../repositories';

export class RestaurantTermsUrlController {
  constructor(
    @repository(RestaurantRepository) protected restaurantRepository: RestaurantRepository,
  ) { }

  @get('/restaurants/{id}/terms-url', {
    responses: {
      '200': {
        description: 'Restaurant has one TermsUrl',
        content: {
          'application/json': {
            schema: getModelSchemaRef(TermsUrl),
          },
        },
      },
    },
  })
  async get(
    @param.path.number('id') id: number,
    @param.query.object('filter') filter?: Filter<TermsUrl>,
  ): Promise<TermsUrl> {
    return this.restaurantRepository.termsUrl(id).get(filter);
  }

  @post('/restaurants/{id}/terms-url', {
    responses: {
      '200': {
        description: 'Restaurant model instance',
        content: {'application/json': {schema: getModelSchemaRef(TermsUrl)}},
      },
    },
  })
  async create(
    @param.path.number('id') id: typeof Restaurant.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(TermsUrl, {
            title: 'NewTermsUrlInRestaurant',
            exclude: ['id'],
            optional: ['restaurantId']
          }),
        },
      },
    }) termsUrl: Omit<TermsUrl, 'id'>,
  ): Promise<TermsUrl> {
    return this.restaurantRepository.termsUrl(id).create(termsUrl);
  }

  @patch('/restaurants/{id}/terms-url', {
    responses: {
      '200': {
        description: 'Restaurant.TermsUrl PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(TermsUrl, {partial: true}),
        },
      },
    })
    termsUrl: Partial<TermsUrl>,
    @param.query.object('where', getWhereSchemaFor(TermsUrl)) where?: Where<TermsUrl>,
  ): Promise<Count> {
    return this.restaurantRepository.termsUrl(id).patch(termsUrl, where);
  }

  @del('/restaurants/{id}/terms-url', {
    responses: {
      '200': {
        description: 'Restaurant.TermsUrl DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(TermsUrl)) where?: Where<TermsUrl>,
  ): Promise<Count> {
    return this.restaurantRepository.termsUrl(id).delete(where);
  }
}
