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
import {Item, ItemVariant} from '../models';
import {ItemRepository} from '../repositories';
import {AuthorizationRoles} from '../types/jwt';

@authenticate('jwt')
@authorize({
  allowedRoles: [AuthorizationRoles.ADMIN],
})
export class ItemItemVariantController {
  constructor(
    @repository(ItemRepository) protected itemRepository: ItemRepository,
  ) {}

  @get('/items/{id}/item-variants', {
    responses: {
      '200': {
        description:
          'Array of Item has many ItemVariant through ItemVariantRelation',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(ItemVariant)},
          },
        },
      },
    },
  })
  async find(
    @param.path.number('id') id: number,
    @param.query.object('filter') filter?: Filter<ItemVariant>,
  ): Promise<ItemVariant[]> {
    return this.itemRepository.itemVariants(id).find(filter);
  }

  @post('/items/{id}/item-variants', {
    responses: {
      '200': {
        description: 'create a ItemVariant model instance',
        content: {'application/json': {schema: getModelSchemaRef(ItemVariant)}},
      },
    },
  })
  async create(
    @param.path.number('id') id: typeof Item.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ItemVariant, {
            title: 'NewItemVariantInItem',
            exclude: ['id'],
          }),
        },
      },
    })
    itemVariant: Omit<ItemVariant, 'id'>,
  ): Promise<ItemVariant> {
    return this.itemRepository.itemVariants(id).create(itemVariant);
  }

  @patch('/items/{id}/item-variants', {
    responses: {
      '200': {
        description: 'Item.ItemVariant PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ItemVariant, {partial: true}),
        },
      },
    })
    itemVariant: Partial<ItemVariant>,
    @param.query.object('where', getWhereSchemaFor(ItemVariant))
    where?: Where<ItemVariant>,
  ): Promise<Count> {
    return this.itemRepository.itemVariants(id).patch(itemVariant, where);
  }

  @del('/items/{id}/item-variants', {
    responses: {
      '200': {
        description: 'Item.ItemVariant DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(ItemVariant))
    where?: Where<ItemVariant>,
  ): Promise<Count> {
    return this.itemRepository.itemVariants(id).delete(where);
  }
}
