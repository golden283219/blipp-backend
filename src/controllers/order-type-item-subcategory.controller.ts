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
import {ItemSubcategory, OrderType} from '../models';
import {OrderTypeRepository} from '../repositories';
import {AuthorizationRoles} from '../types/jwt';

@authenticate('jwt')
@authorize({
  allowedRoles: [AuthorizationRoles.ADMIN],
})
export class OrderTypeItemSubcategoryController {
  constructor(
    @repository(OrderTypeRepository)
    protected orderTypeRepository: OrderTypeRepository,
  ) {}

  @get('/order-types/{id}/item-subcategories', {
    responses: {
      '200': {
        description:
          'Array of OrderType has many ItemSubcategory through SubcategoryOrderType',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(ItemSubcategory)},
          },
        },
      },
    },
  })
  async find(
    @param.path.number('id') id: number,
    @param.query.object('filter') filter?: Filter<ItemSubcategory>,
  ): Promise<ItemSubcategory[]> {
    return this.orderTypeRepository.itemSubcategories(id).find(filter);
  }

  @post('/order-types/{id}/item-subcategories', {
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
    @param.path.number('id') id: typeof OrderType.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ItemSubcategory, {
            title: 'NewItemSubcategoryInOrderType',
            exclude: ['id'],
          }),
        },
      },
    })
    itemSubcategory: Omit<ItemSubcategory, 'id'>,
  ): Promise<ItemSubcategory> {
    return this.orderTypeRepository
      .itemSubcategories(id)
      .create(itemSubcategory);
  }

  @patch('/order-types/{id}/item-subcategories', {
    responses: {
      '200': {
        description: 'OrderType.ItemSubcategory PATCH success count',
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
    return this.orderTypeRepository
      .itemSubcategories(id)
      .patch(itemSubcategory, where);
  }

  @del('/order-types/{id}/item-subcategories', {
    responses: {
      '200': {
        description: 'OrderType.ItemSubcategory DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(ItemSubcategory))
    where?: Where<ItemSubcategory>,
  ): Promise<Count> {
    return this.orderTypeRepository.itemSubcategories(id).delete(where);
  }
}
