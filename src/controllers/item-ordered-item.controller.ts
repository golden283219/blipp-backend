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
import {Item, OrderedItem} from '../models';
import {ItemRepository} from '../repositories';
import {AuthorizationRoles} from '../types/jwt';

@authenticate('jwt')
@authorize({
  allowedRoles: [AuthorizationRoles.ADMIN],
})
export class ItemOrderedItemController {
  constructor(
    @repository(ItemRepository) protected itemRepository: ItemRepository,
  ) {}

  @get('/items/{id}/ordered-items', {
    responses: {
      '200': {
        description: 'Array of Item has many OrderedItem',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(OrderedItem)},
          },
        },
      },
    },
  })
  async find(
    @param.path.number('id') id: number,
    @param.query.object('filter') filter?: Filter<OrderedItem>,
  ): Promise<OrderedItem[]> {
    return this.itemRepository.orderedItems(id).find(filter);
  }

  @post('/items/{id}/ordered-items', {
    responses: {
      '200': {
        description: 'Item model instance',
        content: {'application/json': {schema: getModelSchemaRef(OrderedItem)}},
      },
    },
  })
  async create(
    @param.path.number('id') id: typeof Item.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(OrderedItem, {
            title: 'NewOrderedItemInItem',
            exclude: ['id'],
            optional: ['itemId'],
          }),
        },
      },
    })
    orderedItem: Omit<OrderedItem, 'id'>,
  ): Promise<OrderedItem> {
    return this.itemRepository.orderedItems(id).create(orderedItem);
  }

  @patch('/items/{id}/ordered-items', {
    responses: {
      '200': {
        description: 'Item.OrderedItem PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(OrderedItem, {partial: true}),
        },
      },
    })
    orderedItem: Partial<OrderedItem>,
    @param.query.object('where', getWhereSchemaFor(OrderedItem))
    where?: Where<OrderedItem>,
  ): Promise<Count> {
    return this.itemRepository.orderedItems(id).patch(orderedItem, where);
  }

  @del('/items/{id}/ordered-items', {
    responses: {
      '200': {
        description: 'Item.OrderedItem DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(OrderedItem))
    where?: Where<OrderedItem>,
  ): Promise<Count> {
    return this.itemRepository.orderedItems(id).delete(where);
  }
}
