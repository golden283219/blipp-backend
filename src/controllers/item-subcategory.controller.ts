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
import {ItemSubcategory} from '../models';
import {ItemSubcategoryRepository} from '../repositories';
import {AuthorizationRoles} from '../types/jwt';

export class ItemSubcategoryController {
  constructor(
    @repository(ItemSubcategoryRepository)
    public itemSubcategoryRepository: ItemSubcategoryRepository,
  ) {}

  @authenticate('jwt')
  @authorize({
    allowedRoles: [AuthorizationRoles.ADMIN],
  })
  @post('/item-subcategories', {
    responses: {
      '200': {
        description: 'ItemSubcategory model instance',
        content: {
          'application/json': {schema: getModelSchemaRef(ItemSubcategory)},
        },
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ItemSubcategory, {
            title: 'NewItemSubcategory',
            exclude: ['id'],
          }),
        },
      },
    })
    itemSubcategory: Omit<ItemSubcategory, 'id'>,
  ): Promise<ItemSubcategory> {
    return this.itemSubcategoryRepository.create(itemSubcategory);
  }

  @authenticate('jwt')
  @authorize({
    allowedRoles: [AuthorizationRoles.ADMIN],
  })
  @get('/item-subcategories/count', {
    responses: {
      '200': {
        description: 'ItemSubcategory model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.where(ItemSubcategory) where?: Where<ItemSubcategory>,
  ): Promise<Count> {
    return this.itemSubcategoryRepository.count(where);
  }

  @get('/item-subcategories', {
    responses: {
      '200': {
        description: 'Array of ItemSubcategory model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(ItemSubcategory, {
                includeRelations: true,
              }),
            },
          },
        },
      },
    },
  })
  async find(
    @param.filter(ItemSubcategory) filter?: Filter<ItemSubcategory>,
  ): Promise<ItemSubcategory[]> {
    return this.itemSubcategoryRepository.find({
      ...filter,
      include: ['orderTypes'],
    });
  }

  @authenticate('jwt')
  @authorize({
    allowedRoles: [AuthorizationRoles.ADMIN],
  })
  @patch('/item-subcategories', {
    responses: {
      '200': {
        description: 'ItemSubcategory PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ItemSubcategory, {partial: true}),
        },
      },
    })
    itemSubcategory: ItemSubcategory,
    @param.where(ItemSubcategory) where?: Where<ItemSubcategory>,
  ): Promise<Count> {
    return this.itemSubcategoryRepository.updateAll(itemSubcategory, where);
  }

  @authenticate('jwt')
  @authorize({
    allowedRoles: [AuthorizationRoles.RESTAURANT, AuthorizationRoles.ADMIN],
  })
  @get('/item-subcategories/{id}', {
    operationId: 'getSubcategory',
    responses: {
      '200': {
        description: 'ItemSubcategory model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(ItemSubcategory, {
              includeRelations: true,
            }),
          },
        },
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(ItemSubcategory, {exclude: 'where'})
    filter?: FilterExcludingWhere<ItemSubcategory>,
  ): Promise<ItemSubcategory> {
    return this.itemSubcategoryRepository.findById(id, {
      ...filter,
      include: ['orderTypes'],
    });
  }

  @authenticate('jwt')
  @authorize({
    allowedRoles: [AuthorizationRoles.ADMIN],
  })
  @patch('/item-subcategories/{id}', {
    responses: {
      '204': {
        description: 'ItemSubcategory PATCH success',
      },
    },
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ItemSubcategory, {partial: true}),
        },
      },
    })
    itemSubcategory: ItemSubcategory,
  ): Promise<void> {
    await this.itemSubcategoryRepository.updateById(id, itemSubcategory);
  }

  @authenticate('jwt')
  @authorize({
    allowedRoles: [AuthorizationRoles.ADMIN],
  })
  @put('/item-subcategories/{id}', {
    responses: {
      '204': {
        description: 'ItemSubcategory PUT success',
      },
    },
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() itemSubcategory: ItemSubcategory,
  ): Promise<void> {
    await this.itemSubcategoryRepository.replaceById(id, itemSubcategory);
  }

  @authenticate('jwt')
  @authorize({
    allowedRoles: [AuthorizationRoles.ADMIN],
  })
  @del('/item-subcategories/{id}', {
    responses: {
      '204': {
        description: 'ItemSubcategory DELETE success',
      },
    },
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.itemSubcategoryRepository.deleteById(id);
  }
}
