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
import {ItemVariantOptionRelation} from '../models';
import {ItemVariantOptionRelationRepository} from '../repositories';
import {AuthorizationRoles} from '../types/jwt';

@authenticate('jwt')
@authorize({
  allowedRoles: [AuthorizationRoles.RESTAURANT, AuthorizationRoles.ADMIN],
})
export class ItemVariantOptionRelationController {
  constructor(
    @repository(ItemVariantOptionRelationRepository)
    public itemVariantOptionRelationRepository: ItemVariantOptionRelationRepository,
  ) {}

  @post('/item-variant-option-relations', {
    responses: {
      '200': {
        description: 'ItemVariantOptionRelation model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(ItemVariantOptionRelation),
          },
        },
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ItemVariantOptionRelation, {
            title: 'NewItemVariantOptionRelation',
            exclude: ['id'],
          }),
        },
      },
    })
    itemVariantOptionRelation: Omit<ItemVariantOptionRelation, 'id'>,
  ): Promise<ItemVariantOptionRelation> {
    return this.itemVariantOptionRelationRepository.create(
      itemVariantOptionRelation,
    );
  }

  @get('/item-variant-option-relations/count', {
    responses: {
      '200': {
        description: 'ItemVariantOptionRelation model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.where(ItemVariantOptionRelation)
    where?: Where<ItemVariantOptionRelation>,
  ): Promise<Count> {
    return this.itemVariantOptionRelationRepository.count(where);
  }

  @get('/item-variant-option-relations', {
    responses: {
      '200': {
        description: 'Array of ItemVariantOptionRelation model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(ItemVariantOptionRelation, {
                includeRelations: true,
              }),
            },
          },
        },
      },
    },
  })
  async find(
    @param.filter(ItemVariantOptionRelation)
    filter?: Filter<ItemVariantOptionRelation>,
  ): Promise<ItemVariantOptionRelation[]> {
    return this.itemVariantOptionRelationRepository.find(filter);
  }

  @patch('/item-variant-option-relations', {
    responses: {
      '200': {
        description: 'ItemVariantOptionRelation PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ItemVariantOptionRelation, {partial: true}),
        },
      },
    })
    itemVariantOptionRelation: ItemVariantOptionRelation,
    @param.where(ItemVariantOptionRelation)
    where?: Where<ItemVariantOptionRelation>,
  ): Promise<Count> {
    return this.itemVariantOptionRelationRepository.updateAll(
      itemVariantOptionRelation,
      where,
    );
  }

  @get('/item-variant-option-relations/{id}', {
    responses: {
      '200': {
        description: 'ItemVariantOptionRelation model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(ItemVariantOptionRelation, {
              includeRelations: true,
            }),
          },
        },
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(ItemVariantOptionRelation, {exclude: 'where'})
    filter?: FilterExcludingWhere<ItemVariantOptionRelation>,
  ): Promise<ItemVariantOptionRelation> {
    return this.itemVariantOptionRelationRepository.findById(id, filter);
  }

  @patch('/item-variant-option-relations/{id}', {
    responses: {
      '204': {
        description: 'ItemVariantOptionRelation PATCH success',
      },
    },
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ItemVariantOptionRelation, {partial: true}),
        },
      },
    })
    itemVariantOptionRelation: ItemVariantOptionRelation,
  ): Promise<void> {
    await this.itemVariantOptionRelationRepository.updateById(
      id,
      itemVariantOptionRelation,
    );
  }

  @put('/item-variant-option-relations/{id}', {
    responses: {
      '204': {
        description: 'ItemVariantOptionRelation PUT success',
      },
    },
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() itemVariantOptionRelation: ItemVariantOptionRelation,
  ): Promise<void> {
    await this.itemVariantOptionRelationRepository.replaceById(
      id,
      itemVariantOptionRelation,
    );
  }

  @del('/item-variant-option-relations/{id}', {
    responses: {
      '204': {
        description: 'ItemVariantOptionRelation DELETE success',
      },
    },
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.itemVariantOptionRelationRepository.deleteById(id);
  }
}
