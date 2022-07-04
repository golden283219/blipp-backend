import {authenticate} from '@loopback/authentication';
import {authorize} from '@loopback/authorization';
import {Count, CountSchema, repository, Where} from '@loopback/repository';
import {
  del,
  getModelSchemaRef,
  getWhereSchemaFor,
  param,
  patch,
  post,
  requestBody,
} from '@loopback/rest';
import {ItemSubcategory, Restaurant} from '../models';
import {RestaurantRepository} from '../repositories';
import {AuthorizationRoles} from '../types/jwt';

@authenticate('jwt')
@authorize({
  allowedRoles: [AuthorizationRoles.ADMIN],
})
export class RestaurantItemSubcategoryController {
  constructor(
    @repository(RestaurantRepository)
    protected restaurantRepository: RestaurantRepository,
  ) {}

  @post('/restaurants/{id}/item-subcategories', {
    responses: {
      '200': {
        description: 'create a ItemSubcategory model instance',
        content: {
          'application/json': {schema: getModelSchemaRef(ItemSubcategory)},
        },
      },
    },
  })
  async create(
    @param.path.number('id') id: typeof Restaurant.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ItemSubcategory, {
            title: 'NewItemSubcategoryInRestaurant',
            exclude: ['id'],
          }),
        },
      },
    })
    itemSubcategory: Omit<ItemSubcategory, 'id'>,
  ): Promise<ItemSubcategory> {
    return this.restaurantRepository
      .itemSubcategories(id)
      .create(itemSubcategory);
  }

  @patch('/restaurants/{id}/item-subcategories', {
    responses: {
      '200': {
        description: 'Restaurant.ItemSubcategory PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ItemSubcategory, {partial: true}),
        },
      },
    })
    itemSubcategory: Partial<ItemSubcategory>,
    @param.query.object('where', getWhereSchemaFor(ItemSubcategory))
    where?: Where<ItemSubcategory>,
  ): Promise<Count> {
    return this.restaurantRepository
      .itemSubcategories(id)
      .patch(itemSubcategory, where);
  }

  @del('/restaurants/{id}/item-subcategories', {
    responses: {
      '200': {
        description: 'Restaurant.ItemSubcategory DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(ItemSubcategory))
    where?: Where<ItemSubcategory>,
  ): Promise<Count> {
    return this.restaurantRepository.itemSubcategories(id).delete(where);
  }
}
