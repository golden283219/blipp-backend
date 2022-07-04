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
import {ItemVariant, ItemVariantOption} from '../models';
import {ItemVariantRepository} from '../repositories';

export class ItemVariantItemVariantOptionController {
  constructor(
    @repository(ItemVariantRepository)
    protected itemVariantRepository: ItemVariantRepository,
  ) {}

  @get('/item-variants/{id}/item-variant-options', {
    responses: {
      '200': {
        description:
          'Array of ItemVariant has many ItemVariantOption through ItemVariantOptionRelation',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(ItemVariantOption),
            },
          },
        },
      },
    },
  })
  async find(
    @param.path.number('id') id: number,
    @param.query.object('filter') filter?: Filter<ItemVariantOption>,
  ): Promise<ItemVariantOption[]> {
    return this.itemVariantRepository.itemVariantOptions(id).find(filter);
  }

  @post('/item-variants/{id}/item-variant-options', {
    responses: {
      '200': {
        description: 'create a ItemVariantOption model instance',
        content: {
          'application/json': {schema: getModelSchemaRef(ItemVariantOption)},
        },
      },
    },
  })
  async create(
    @param.path.number('id') id: typeof ItemVariant.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ItemVariantOption, {
            title: 'NewItemVariantOptionInItemVariant',
            exclude: ['id'],
          }),
        },
      },
    })
    itemVariantOption: Omit<ItemVariantOption, 'id'>,
  ): Promise<ItemVariantOption> {
    return this.itemVariantRepository
      .itemVariantOptions(id)
      .create(itemVariantOption);
  }

  @patch('/item-variants/{id}/item-variant-options', {
    responses: {
      '200': {
        description: 'ItemVariant.ItemVariantOption PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ItemVariantOption, {partial: true}),
        },
      },
    })
    itemVariantOption: Partial<ItemVariantOption>,
    @param.query.object('where', getWhereSchemaFor(ItemVariantOption))
    where?: Where<ItemVariantOption>,
  ): Promise<Count> {
    return this.itemVariantRepository
      .itemVariantOptions(id)
      .patch(itemVariantOption, where);
  }

  @del('/item-variants/{id}/item-variant-options', {
    responses: {
      '200': {
        description: 'ItemVariant.ItemVariantOption DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(ItemVariantOption))
    where?: Where<ItemVariantOption>,
  ): Promise<Count> {
    return this.itemVariantRepository.itemVariantOptions(id).delete(where);
  }
}
