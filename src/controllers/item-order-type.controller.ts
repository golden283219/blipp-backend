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
import {ItemOrderType} from '../models';
import {ItemOrderTypeRepository} from '../repositories';
import {AuthorizationRoles} from '../types/jwt';

@authenticate('jwt')
@authorize({
  allowedRoles: [AuthorizationRoles.ADMIN],
})
export class ItemOrderTypeController {
  constructor(
    @repository(ItemOrderTypeRepository)
    public itemOrderTypeRepository: ItemOrderTypeRepository,
  ) {}

  @post('/item-order-types', {
    responses: {
      '200': {
        description: 'ItemOrderType model instance',
        content: {
          'application/json': {schema: getModelSchemaRef(ItemOrderType)},
        },
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ItemOrderType, {
            title: 'NewItemOrderType',
            exclude: ['id'],
          }),
        },
      },
    })
    itemOrderType: Omit<ItemOrderType, 'id'>,
  ): Promise<ItemOrderType> {
    return this.itemOrderTypeRepository.create(itemOrderType);
  }

  @get('/item-order-types/count', {
    responses: {
      '200': {
        description: 'ItemOrderType model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.where(ItemOrderType) where?: Where<ItemOrderType>,
  ): Promise<Count> {
    return this.itemOrderTypeRepository.count(where);
  }

  @get('/item-order-types', {
    responses: {
      '200': {
        description: 'Array of ItemOrderType model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(ItemOrderType, {includeRelations: true}),
            },
          },
        },
      },
    },
  })
  async find(
    @param.filter(ItemOrderType) filter?: Filter<ItemOrderType>,
  ): Promise<ItemOrderType[]> {
    return this.itemOrderTypeRepository.find(filter);
  }

  @patch('/item-order-types', {
    responses: {
      '200': {
        description: 'ItemOrderType PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ItemOrderType, {partial: true}),
        },
      },
    })
    itemOrderType: ItemOrderType,
    @param.where(ItemOrderType) where?: Where<ItemOrderType>,
  ): Promise<Count> {
    return this.itemOrderTypeRepository.updateAll(itemOrderType, where);
  }

  @get('/item-order-types/{id}', {
    responses: {
      '200': {
        description: 'ItemOrderType model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(ItemOrderType, {includeRelations: true}),
          },
        },
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(ItemOrderType, {exclude: 'where'})
    filter?: FilterExcludingWhere<ItemOrderType>,
  ): Promise<ItemOrderType> {
    return this.itemOrderTypeRepository.findById(id, filter);
  }

  @patch('/item-order-types/{id}', {
    responses: {
      '204': {
        description: 'ItemOrderType PATCH success',
      },
    },
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ItemOrderType, {partial: true}),
        },
      },
    })
    itemOrderType: ItemOrderType,
  ): Promise<void> {
    await this.itemOrderTypeRepository.updateById(id, itemOrderType);
  }

  @put('/item-order-types/{id}', {
    responses: {
      '204': {
        description: 'ItemOrderType PUT success',
      },
    },
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() itemOrderType: ItemOrderType,
  ): Promise<void> {
    await this.itemOrderTypeRepository.replaceById(id, itemOrderType);
  }

  @del('/item-order-types/{id}', {
    responses: {
      '204': {
        description: 'ItemOrderType DELETE success',
      },
    },
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.itemOrderTypeRepository.deleteById(id);
  }
}
