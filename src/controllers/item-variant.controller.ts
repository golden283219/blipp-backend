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
import {ItemVariant} from '../models';
import {ItemVariantRepository} from '../repositories';
import {AuthorizationRoles} from '../types/jwt';

export class ItemVariantController {
  constructor(
    @repository(ItemVariantRepository)
    public itemVariantRepository: ItemVariantRepository,
  ) {}

  @authenticate('jwt')
  @authorize({
    allowedRoles: [AuthorizationRoles.ADMIN],
  })
  @post('/item-variants', {
    responses: {
      '200': {
        description: 'ItemVariant model instance',
        content: {'application/json': {schema: getModelSchemaRef(ItemVariant)}},
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ItemVariant, {
            title: 'NewItemVariant',
            exclude: ['id'],
          }),
        },
      },
    })
    itemVariant: Omit<ItemVariant, 'id'>,
  ): Promise<ItemVariant> {
    return this.itemVariantRepository.create(itemVariant);
  }

  @authenticate('jwt')
  @authorize({
    allowedRoles: [AuthorizationRoles.ADMIN],
  })
  @get('/item-variants/count', {
    responses: {
      '200': {
        description: 'ItemVariant model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.where(ItemVariant) where?: Where<ItemVariant>,
  ): Promise<Count> {
    return this.itemVariantRepository.count(where);
  }

  @get('/item-variants', {
    responses: {
      '200': {
        description: 'Array of ItemVariant model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(ItemVariant, {includeRelations: true}),
            },
          },
        },
        links: {
          options: {
            operationId: 'getItemVariantOption',
            parameters: {
              itemVariantId: '$response.body#/id',
            },
          },
        },
      },
    },
  })
  async find(
    @param.filter(ItemVariant) filter?: Filter<ItemVariant>,
  ): Promise<ItemVariant[]> {
    return this.itemVariantRepository.find({
      ...filter,
      include: ['itemVariantOptions'],
    });
  }

  @authenticate('jwt')
  @authorize({
    allowedRoles: [AuthorizationRoles.ADMIN],
  })
  @patch('/item-variants', {
    responses: {
      '200': {
        description: 'ItemVariant PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ItemVariant, {partial: true}),
        },
      },
    })
    itemVariant: ItemVariant,
    @param.where(ItemVariant) where?: Where<ItemVariant>,
  ): Promise<Count> {
    return this.itemVariantRepository.updateAll(itemVariant, where);
  }

  @authenticate('jwt')
  @authorize({
    allowedRoles: [AuthorizationRoles.ADMIN],
  })
  @get('/item-variants/{id}', {
    operationId: 'getItemVariant',
    responses: {
      '200': {
        description: 'ItemVariant model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(ItemVariant, {includeRelations: true}),
          },
        },
        links: {
          options: {
            operationId: 'getVariantOptions',
            parameters: {
              id: '$response.body#/id',
            },
          },
        },
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(ItemVariant, {exclude: 'where'})
    filter?: FilterExcludingWhere<ItemVariant>,
  ): Promise<ItemVariant> {
    return this.itemVariantRepository.findById(id, filter);
  }

  @authenticate('jwt')
  @authorize({
    allowedRoles: [AuthorizationRoles.ADMIN],
  })
  @patch('/item-variants/{id}', {
    responses: {
      '204': {
        description: 'ItemVariant PATCH success',
      },
    },
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ItemVariant, {partial: true}),
        },
      },
    })
    itemVariant: ItemVariant,
  ): Promise<void> {
    await this.itemVariantRepository.updateById(id, itemVariant);
  }

  @authenticate('jwt')
  @authorize({
    allowedRoles: [AuthorizationRoles.ADMIN],
  })
  @put('/item-variants/{id}', {
    responses: {
      '204': {
        description: 'ItemVariant PUT success',
      },
    },
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() itemVariant: ItemVariant,
  ): Promise<void> {
    await this.itemVariantRepository.replaceById(id, itemVariant);
  }

  @authenticate('jwt')
  @authorize({
    allowedRoles: [AuthorizationRoles.ADMIN],
  })
  @del('/item-variants/{id}', {
    responses: {
      '204': {
        description: 'ItemVariant DELETE success',
      },
    },
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.itemVariantRepository.deleteById(id);
  }
}
