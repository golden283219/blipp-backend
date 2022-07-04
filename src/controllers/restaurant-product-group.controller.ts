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
import {ProductGroup, Restaurant} from '../models';
import {RestaurantRepository} from '../repositories';
import {AuthorizationRoles} from '../types/jwt';

@authenticate('jwt')
@authorize({
  allowedRoles: [AuthorizationRoles.ADMIN],
})
export class RestaurantProductGroupController {
  constructor(
    @repository(RestaurantRepository)
    protected restaurantRepository: RestaurantRepository,
  ) {}

  @get('/restaurants/{id}/product-groups', {
    responses: {
      '200': {
        description: 'Array of Restaurant has many ProductGroup',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(ProductGroup)},
          },
        },
      },
    },
  })
  async find(
    @param.path.number('id') id: number,
    @param.query.object('filter') filter?: Filter<ProductGroup>,
  ): Promise<ProductGroup[]> {
    return this.restaurantRepository.productGroups(id).find(filter);
  }

  @post('/restaurants/{id}/product-groups', {
    responses: {
      '200': {
        description: 'Restaurant model instance',
        content: {
          'application/json': {schema: getModelSchemaRef(ProductGroup)},
        },
      },
    },
  })
  async create(
    @param.path.number('id') id: typeof Restaurant.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ProductGroup, {
            title: 'NewProductGroupInRestaurant',
            exclude: ['id'],
            optional: ['restaurantId'],
          }),
        },
      },
    })
    productGroup: Omit<ProductGroup, 'id'>,
  ): Promise<ProductGroup> {
    return this.restaurantRepository.productGroups(id).create(productGroup);
  }

  @patch('/restaurants/{id}/product-groups', {
    responses: {
      '200': {
        description: 'Restaurant.ProductGroup PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ProductGroup, {partial: true}),
        },
      },
    })
    productGroup: Partial<ProductGroup>,
    @param.query.object('where', getWhereSchemaFor(ProductGroup))
    where?: Where<ProductGroup>,
  ): Promise<Count> {
    return this.restaurantRepository
      .productGroups(id)
      .patch(productGroup, where);
  }

  @del('/restaurants/{id}/product-groups', {
    responses: {
      '200': {
        description: 'Restaurant.ProductGroup DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(ProductGroup))
    where?: Where<ProductGroup>,
  ): Promise<Count> {
    return this.restaurantRepository.productGroups(id).delete(where);
  }
}
