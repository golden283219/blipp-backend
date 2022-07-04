import {authenticate} from '@loopback/authentication';
import {authorize} from '@loopback/authorization';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  param,
  patch,
  post,
  put,
  requestBody,
} from '@loopback/rest';
import {OrderedItem} from '../models';
import {OrderedItemRepository} from '../repositories';
import {AuthorizationRoles} from '../types/jwt';

@authenticate('jwt')
export class OrderedItemController {
  constructor(
    @repository(OrderedItemRepository)
    public orderedItemRepository: OrderedItemRepository,
  ) {}

  @post('/ordered-items', {
    responses: {
      '200': {
        description: 'OrderedItem model instance',
        content: {'application/json': {schema: getModelSchemaRef(OrderedItem)}},
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(OrderedItem, {
            title: 'NewOrderedItem',
            exclude: ['id'],
          }),
        },
      },
    })
    orderedItem: Omit<OrderedItem, 'id'>,
  ): Promise<OrderedItem> {
    return this.orderedItemRepository.create(orderedItem);
  }

  @authorize({
    allowedRoles: [AuthorizationRoles.ADMIN],
  })
  @get('/ordered-items/count', {
    responses: {
      '200': {
        description: 'OrderedItem model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.where(OrderedItem) where?: Where<OrderedItem>,
  ): Promise<Count> {
    return this.orderedItemRepository.count(where);
  }

  @authorize({
    allowedRoles: [AuthorizationRoles.ADMIN],
  })
  @get('/ordered-items', {
    responses: {
      '200': {
        description: 'Array of OrderedItem model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(OrderedItem, {includeRelations: true}),
            },
          },
        },
      },
    },
  })
  async find(
    @param.filter(OrderedItem) filter?: Filter<OrderedItem>,
  ): Promise<OrderedItem[]> {
    return this.orderedItemRepository.find(filter);
  }

  @authorize({
    allowedRoles: [AuthorizationRoles.ADMIN],
  })
  @patch('/ordered-items', {
    responses: {
      '200': {
        description: 'OrderedItem PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(OrderedItem, {partial: true}),
        },
      },
    })
    orderedItem: OrderedItem,
    @param.where(OrderedItem) where?: Where<OrderedItem>,
  ): Promise<Count> {
    return this.orderedItemRepository.updateAll(orderedItem, where);
  }

  @authorize({
    allowedRoles: [AuthorizationRoles.ADMIN],
  })
  @get('/ordered-items/{id}', {
    responses: {
      '200': {
        description: 'OrderedItem model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(OrderedItem, {includeRelations: true}),
          },
        },
        links: {
          fullItem: {
            operationId: 'getItem',
            parameters: {
              id: '$response.body#/itemId',
            },
          },
        },
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(OrderedItem, {exclude: 'where'})
    filter?: FilterExcludingWhere<OrderedItem>,
  ): Promise<OrderedItem> {
    return this.orderedItemRepository.findById(id, filter);
  }

  @authorize({
    allowedRoles: [AuthorizationRoles.ADMIN],
  })
  @patch('/ordered-items/{id}', {
    responses: {
      '204': {
        description: 'OrderedItem PATCH success',
      },
    },
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(OrderedItem, {partial: true}),
        },
      },
    })
    orderedItem: OrderedItem,
  ): Promise<void> {
    await this.orderedItemRepository.updateById(id, orderedItem);
  }

  @authorize({
    allowedRoles: [AuthorizationRoles.ADMIN],
  })
  @put('/ordered-items/{id}', {
    responses: {
      '204': {
        description: 'OrderedItem PUT success',
      },
    },
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() orderedItem: OrderedItem,
  ): Promise<void> {
    await this.orderedItemRepository.replaceById(id, orderedItem);
  }

  @authorize({
    allowedRoles: [AuthorizationRoles.ADMIN],
  })
  @del('/ordered-items/{id}', {
    responses: {
      '204': {
        description: 'OrderedItem DELETE success',
      },
    },
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.orderedItemRepository.deleteById(id);
  }
}
