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
import {ItemSubcategoryRepository} from '../repositories';
import {AuthorizationRoles} from '../types/jwt';

@authenticate('jwt')
@authorize({
  allowedRoles: [AuthorizationRoles.ADMIN],
})
export class ItemSubcategoryOrderTypeController {
  constructor(
    @repository(ItemSubcategoryRepository)
    protected itemSubcategoryRepository: ItemSubcategoryRepository,
  ) {}

  @get('/item-subcategories/{id}/order-types', {
    responses: {
      '200': {
        description:
          'Array of ItemSubcategory has many OrderType through SubcategoryOrderType',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(OrderType)},
          },
        },
      },
    },
  })
  async find(
    @param.path.number('id') id: number,
    @param.query.object('filter') filter?: Filter<OrderType>,
  ): Promise<OrderType[]> {
    return this.itemSubcategoryRepository.orderTypes(id).find(filter);
  }

  @post('/item-subcategories/{id}/order-types', {
    responses: {
      '200': {
        description: 'create a OrderType model instance',
        content: {'application/json': {schema: getModelSchemaRef(OrderType)}},
      },
    },
  })
  async create(
    @param.path.number('id') id: typeof ItemSubcategory.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(OrderType, {
            title: 'NewOrderTypeInItemSubcategory',
            exclude: ['id'],
          }),
        },
      },
    })
    orderType: Omit<OrderType, 'id'>,
  ): Promise<OrderType> {
    return this.itemSubcategoryRepository.orderTypes(id).create(orderType);
  }

  @patch('/item-subcategories/{id}/order-types', {
    responses: {
      '200': {
        description: 'ItemSubcategory.OrderType PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(OrderType, {partial: true}),
        },
      },
    })
    orderType: Partial<OrderType>,
    @param.query.object('where', getWhereSchemaFor(OrderType))
    where?: Where<OrderType>,
  ): Promise<Count> {
    return this.itemSubcategoryRepository
      .orderTypes(id)
      .patch(orderType, where);
  }

  @del('/item-subcategories/{id}/order-types', {
    responses: {
      '200': {
        description: 'ItemSubcategory.OrderType DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(OrderType))
    where?: Where<OrderType>,
  ): Promise<Count> {
    return this.itemSubcategoryRepository.orderTypes(id).delete(where);
  }
}
