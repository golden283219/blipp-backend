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
import {Item, ItemSubcategory} from '../models';
import {ItemSubcategoryRepository} from '../repositories';
import {AuthorizationRoles} from '../types/jwt';

export class ItemSubcategoryItemController {
  constructor(
    @repository(ItemSubcategoryRepository)
    protected itemSubcategoryRepository: ItemSubcategoryRepository,
  ) {}

  @get('/item-subcategories/{id}/items', {
    responses: {
      '200': {
        description: 'Array of ItemSubcategory has many Item',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Item, {includeRelations: true}),
            },
          },
        },
      },
    },
  })
  async find(
    @param.path.number('id') id: number,
    @param.query.object('filter') filter?: Filter<Item>,
  ): Promise<Item[]> {
    return this.itemSubcategoryRepository
      .items(id)
      .find({...filter, include: ['productGroup']});
  }

  @authenticate('jwt')
  @authorize({
    allowedRoles: [AuthorizationRoles.ADMIN],
  })
  @post('/item-subcategories/{id}/items', {
    responses: {
      '200': {
        description: 'ItemSubcategory model instance',
        content: {'application/json': {schema: getModelSchemaRef(Item)}},
      },
    },
  })
  async create(
    @param.path.number('id') id: typeof ItemSubcategory.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Item, {
            title: 'NewItemInItemSubcategory',
            exclude: ['id'],
            optional: ['itemSubcategoryId'],
          }),
        },
      },
    })
    item: Omit<Item, 'id'>,
  ): Promise<Item> {
    return this.itemSubcategoryRepository.items(id).create(item);
  }

  @authenticate('jwt')
  @authorize({
    allowedRoles: [AuthorizationRoles.ADMIN],
  })
  @patch('/item-subcategories/{id}/items', {
    responses: {
      '200': {
        description: 'ItemSubcategory.Item PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Item, {partial: true}),
        },
      },
    })
    item: Partial<Item>,
    @param.query.object('where', getWhereSchemaFor(Item)) where?: Where<Item>,
  ): Promise<Count> {
    return this.itemSubcategoryRepository.items(id).patch(item, where);
  }

  @authenticate('jwt')
  @authorize({
    allowedRoles: [AuthorizationRoles.ADMIN],
  })
  @del('/item-subcategories/{id}/items', {
    responses: {
      '200': {
        description: 'ItemSubcategory.Item DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(Item)) where?: Where<Item>,
  ): Promise<Count> {
    return this.itemSubcategoryRepository.items(id).delete(where);
  }
}
