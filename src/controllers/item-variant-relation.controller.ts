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
import {ItemVariantRelation} from '../models';
import {ItemVariantRelationRepository} from '../repositories';
import {AuthorizationRoles} from '../types/jwt';

@authenticate('jwt')
@authorize({
  allowedRoles: [AuthorizationRoles.RESTAURANT, AuthorizationRoles.ADMIN],
})
export class ItemVariantRelationController {
  constructor(
    @repository(ItemVariantRelationRepository)
    public itemVariantRelationRepository: ItemVariantRelationRepository,
  ) {}

  @post('/item-variant-relations', {
    responses: {
      '200': {
        description: 'ItemVariantRelation model instance',
        content: {
          'application/json': {schema: getModelSchemaRef(ItemVariantRelation)},
        },
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ItemVariantRelation, {
            title: 'NewItemVariantRelation',
            exclude: ['id'],
          }),
        },
      },
    })
    itemVariantRelation: Omit<ItemVariantRelation, 'id'>,
  ): Promise<ItemVariantRelation> {
    return this.itemVariantRelationRepository.create(itemVariantRelation);
  }

  @get('/item-variant-relations/count', {
    responses: {
      '200': {
        description: 'ItemVariantRelation model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.where(ItemVariantRelation) where?: Where<ItemVariantRelation>,
  ): Promise<Count> {
    return this.itemVariantRelationRepository.count(where);
  }

  @get('/item-variant-relations', {
    responses: {
      '200': {
        description: 'Array of ItemVariantRelation model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(ItemVariantRelation, {
                includeRelations: true,
              }),
            },
          },
        },
      },
    },
  })
  async find(
    @param.filter(ItemVariantRelation) filter?: Filter<ItemVariantRelation>,
  ): Promise<ItemVariantRelation[]> {
    return this.itemVariantRelationRepository.find(filter);
  }

  @patch('/item-variant-relations', {
    responses: {
      '200': {
        description: 'ItemVariantRelation PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ItemVariantRelation, {partial: true}),
        },
      },
    })
    itemVariantRelation: ItemVariantRelation,
    @param.where(ItemVariantRelation) where?: Where<ItemVariantRelation>,
  ): Promise<Count> {
    return this.itemVariantRelationRepository.updateAll(
      itemVariantRelation,
      where,
    );
  }

  @get('/item-variant-relations/{id}', {
    responses: {
      '200': {
        description: 'ItemVariantRelation model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(ItemVariantRelation, {
              includeRelations: true,
            }),
          },
        },
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(ItemVariantRelation, {exclude: 'where'})
    filter?: FilterExcludingWhere<ItemVariantRelation>,
  ): Promise<ItemVariantRelation> {
    return this.itemVariantRelationRepository.findById(id, filter);
  }

  @patch('/item-variant-relations/{id}', {
    responses: {
      '204': {
        description: 'ItemVariantRelation PATCH success',
      },
    },
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ItemVariantRelation, {partial: true}),
        },
      },
    })
    itemVariantRelation: ItemVariantRelation,
  ): Promise<void> {
    await this.itemVariantRelationRepository.updateById(
      id,
      itemVariantRelation,
    );
  }

  @put('/item-variant-relations/{id}', {
    responses: {
      '204': {
        description: 'ItemVariantRelation PUT success',
      },
    },
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() itemVariantRelation: ItemVariantRelation,
  ): Promise<void> {
    await this.itemVariantRelationRepository.replaceById(
      id,
      itemVariantRelation,
    );
  }

  @del('/item-variant-relations/{id}', {
    responses: {
      '204': {
        description: 'ItemVariantRelation DELETE success',
      },
    },
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.itemVariantRelationRepository.deleteById(id);
  }
}
