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
import {Item, ProductGroup} from '../models';
import {ProductGroupRepository} from '../repositories';
import {AuthorizationRoles} from '../types/jwt';

@authenticate('jwt')
@authorize({
  allowedRoles: [AuthorizationRoles.ADMIN],
})
export class ProductGroupItemController {
  constructor(
    @repository(ProductGroupRepository)
    protected productGroupRepository: ProductGroupRepository,
  ) {}

  @get('/product-groups/{id}/items', {
    responses: {
      '200': {
        description: 'Array of ProductGroup has many Item',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Item)},
          },
        },
      },
    },
  })
  async find(
    @param.path.number('id') id: number,
    @param.query.object('filter') filter?: Filter<Item>,
  ): Promise<Item[]> {
    return this.productGroupRepository.items(id).find(filter);
  }

  @post('/product-groups/{id}/items', {
    responses: {
      '200': {
        description: 'ProductGroup model instance',
        content: {'application/json': {schema: getModelSchemaRef(Item)}},
      },
    },
  })
  async create(
    @param.path.number('id') id: typeof ProductGroup.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Item, {
            title: 'NewItemInProductGroup',
            exclude: ['id'],
            optional: ['productGroupId'],
          }),
        },
      },
    })
    item: Omit<Item, 'id'>,
  ): Promise<Item> {
    return this.productGroupRepository.items(id).create(item);
  }

  @patch('/product-groups/{id}/items', {
    responses: {
      '200': {
        description: 'ProductGroup.Item PATCH success count',
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
    return this.productGroupRepository.items(id).patch(item, where);
  }

  @del('/product-groups/{id}/items', {
    responses: {
      '200': {
        description: 'ProductGroup.Item DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(Item)) where?: Where<Item>,
  ): Promise<Count> {
    return this.productGroupRepository.items(id).delete(where);
  }
}
