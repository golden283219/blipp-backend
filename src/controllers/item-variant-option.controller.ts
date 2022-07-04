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
import {ItemVariantOption} from '../models';
import {ItemVariantOptionRepository} from '../repositories';
import {AuthorizationRoles} from '../types/jwt';

@authenticate('jwt')
@authorize({
  allowedRoles: [AuthorizationRoles.ADMIN],
})
export class ItemVariantOptionController {
  constructor(
    @repository(ItemVariantOptionRepository)
    public itemVariantOptionRepository: ItemVariantOptionRepository,
  ) {}

  @post('/item-variant-options', {
    responses: {
      '200': {
        description: 'ItemVariantOption model instance',
        content: {
          'application/json': {schema: getModelSchemaRef(ItemVariantOption)},
        },
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ItemVariantOption, {
            title: 'NewItemVariantOption',
            exclude: ['id'],
          }),
        },
      },
    })
    itemVariantOption: Omit<ItemVariantOption, 'id'>,
  ): Promise<ItemVariantOption> {
    return this.itemVariantOptionRepository.create(itemVariantOption);
  }

  @get('/item-variant-options/count', {
    responses: {
      '200': {
        description: 'ItemVariantOption model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.where(ItemVariantOption) where?: Where<ItemVariantOption>,
  ): Promise<Count> {
    return this.itemVariantOptionRepository.count(where);
  }

  @get('/item-variant-options', {
    responses: {
      '200': {
        description: 'Array of ItemVariantOption model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(ItemVariantOption, {
                includeRelations: true,
              }),
            },
          },
        },
        links: {
          variant: {
            operationId: 'getItemVariant',
            parameters: {
              id: '$response.body#/itemVariantId',
            },
          },
        },
      },
    },
  })
  async find(
    @param.filter(ItemVariantOption) filter?: Filter<ItemVariantOption>,
  ): Promise<ItemVariantOption[]> {
    return this.itemVariantOptionRepository.find(filter);
  }

  @patch('/item-variant-options', {
    responses: {
      '200': {
        description: 'ItemVariantOption PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ItemVariantOption, {partial: true}),
        },
      },
    })
    itemVariantOption: ItemVariantOption,
    @param.where(ItemVariantOption) where?: Where<ItemVariantOption>,
  ): Promise<Count> {
    return this.itemVariantOptionRepository.updateAll(itemVariantOption, where);
  }

  @get('/item-variant-options/{id}', {
    operationId: 'getItemVariantOption',
    responses: {
      '200': {
        description: 'ItemVariantOption model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(ItemVariantOption, {
              includeRelations: true,
            }),
          },
        },
        links: {
          variant: {
            operationId: 'getItemVariant',
            parameters: {
              id: '$response.body#/itemVariantId',
            },
          },
        },
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(ItemVariantOption, {exclude: 'where'})
    filter?: FilterExcludingWhere<ItemVariantOption>,
  ): Promise<ItemVariantOption> {
    return this.itemVariantOptionRepository.findById(id, filter);
  }

  @patch('/item-variant-options/{id}', {
    responses: {
      '204': {
        description: 'ItemVariantOption PATCH success',
      },
    },
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ItemVariantOption, {partial: true}),
        },
      },
    })
    itemVariantOption: ItemVariantOption,
  ): Promise<void> {
    await this.itemVariantOptionRepository.updateById(id, itemVariantOption);
  }

  @put('/item-variant-options/{id}', {
    responses: {
      '204': {
        description: 'ItemVariantOption PUT success',
      },
    },
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() itemVariantOption: ItemVariantOption,
  ): Promise<void> {
    await this.itemVariantOptionRepository.replaceById(id, itemVariantOption);
  }

  @del('/item-variant-options/{id}', {
    responses: {
      '204': {
        description: 'ItemVariantOption DELETE success',
      },
    },
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.itemVariantOptionRepository.deleteById(id);
  }
}
