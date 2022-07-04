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
import {ActiveAllergy, Item} from '../models';
import {AllergyRepository, ItemRepository} from '../repositories';
import {AuthorizationRoles} from '../types/jwt';

export class ItemController {
  constructor(
    @repository(ItemRepository)
    public itemRepository: ItemRepository,
    @repository(AllergyRepository)
    public allergyRepository: AllergyRepository,
  ) {}
  @authenticate('jwt')
  @authorize({
    allowedRoles: [AuthorizationRoles.RESTAURANT, AuthorizationRoles.ADMIN],
  })
  @post('/items', {
    responses: {
      '200': {
        description: 'Item model instance',
        content: {'application/json': {schema: getModelSchemaRef(Item)}},
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Item, {
            title: 'NewItem',
            exclude: ['id'],
          }),
        },
      },
    })
    item: Omit<Item, 'id'>,
  ): Promise<Item> {
    return this.itemRepository.create(item);
  }
  @authenticate('jwt')
  @authorize({
    allowedRoles: [AuthorizationRoles.ADMIN],
  })
  @get('/items/count', {
    responses: {
      '200': {
        description: 'Item model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(@param.where(Item) where?: Where<Item>): Promise<Count> {
    return this.itemRepository.count(where);
  }

  @get('/items/{restaurantId}/{searchString}', {
    responses: {
      '200': {
        description: 'Array of Item model instances',
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
  async search(
    @param.path.number('restaurantId') restaurantId: number,
    @param.path.string('searchString') searchString: string,
    @param.filter(Item) filter?: Filter<Item>,
  ): Promise<Item[]> {
    const restaurantFilter: Filter<Item> = {where: {restaurantId}};
    const fullFilter = {
      ...filter,
      where: {...filter?.where, ...restaurantFilter.where},
      include: ['productGroup'],
    };
    const restaurantItems = await this.itemRepository.find(fullFilter);
    const isTextMatch = (text: string) =>
      text.length > 0 &&
      text.toLowerCase().includes(searchString.toLowerCase());
    const isItemMatch = (item: Item) =>
      isTextMatch(item.name) || isTextMatch(item.description ?? '');
    const matchedItems = restaurantItems.filter(isItemMatch);
    return matchedItems;
  }

  @get('/items/upsell/{id}', {
    responses: {
      '200': {
        description: 'Array of Item model instances',
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
  async getUpsellItems(@param.path.number('id') id: number) {
    try {
      const item = await this.itemRepository.findById(id);
      if (!item?.upSellIds?.length) return [];

      const upSellItems: Item[] = [];
      for (const upSellId of item?.upSellIds) {
        const upSellItem = await this.itemRepository.findById(upSellId, {
          include: [
            'productGroup',
            {
              relation: 'itemVariants',
              scope: {include: ['itemVariantOptions']},
            },
          ],
        });
        if (upSellItem) {
          upSellItems.push(upSellItem);
        }
      }
      return upSellItems;
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  @get('/items/allergies/{id}', {
    responses: {
      '200': {
        description: 'Array of Active Allery model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(ActiveAllergy),
            },
          },
        },
      },
    },
  })
  async getItemAllergies(
    @param.path.number('id') id: number,
  ): Promise<ActiveAllergy[]> {
    try {
      const item = await this.itemRepository.findById(id);
      const {allergyIds, removableAllergyIds} = item ?? {};
      if (!allergyIds || allergyIds.length < 1) {
        return [];
      }

      const activeAllergies = Promise.all(
        allergyIds.map(async allergyId => {
          const {name} = await this.allergyRepository.findById(allergyId);
          const removable = !!removableAllergyIds?.includes(allergyId);
          return new ActiveAllergy({
            id: allergyId,
            name,
            removable,
          });
        }),
      );
      return await activeAllergies;
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  @authenticate('jwt')
  @authorize({
    allowedRoles: [AuthorizationRoles.ADMIN],
  })
  @get('/items', {
    responses: {
      '200': {
        description: 'Array of Item model instances',
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
  async find(@param.filter(Item) filter?: Filter<Item>): Promise<Item[]> {
    return this.itemRepository.find({
      ...filter,
      include: [
        'productGroup',
        'orderTypes',
        {relation: 'itemVariants', scope: {include: ['itemVariantOptions']}},
      ],
    });
  }

  @authenticate('jwt')
  @authorize({
    allowedRoles: [AuthorizationRoles.RESTAURANT, AuthorizationRoles.ADMIN],
  })
  @patch('/items', {
    responses: {
      '200': {
        description: 'Item PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Item, {partial: true}),
        },
      },
    })
    item: Item,
    @param.where(Item) where?: Where<Item>,
  ): Promise<Count> {
    return this.itemRepository.updateAll(item, where);
  }

  @authenticate('jwt')
  @authorize({
    allowedRoles: [AuthorizationRoles.RESTAURANT, AuthorizationRoles.ADMIN],
  })
  @get('/items/{id}', {
    operationId: 'getItem',
    responses: {
      '200': {
        description: 'Item model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Item, {includeRelations: true}),
          },
        },
        links: {
          subcategory: {
            operationId: 'getSubcategory',
            parameters: {
              id: '$response.body#/itemSubcategoryId',
            },
          },
        },
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Item, {exclude: 'where'}) filter?: FilterExcludingWhere<Item>,
  ): Promise<Item> {
    return this.itemRepository.findById(id, {
      ...filter,
      include: [
        {relation: 'itemVariants', scope: {include: ['itemVariantOptions']}},
      ],
    });
  }
  @get('/item/{id}/variants', {
    operationId: 'getItemVariants',
    responses: {
      '200': {
        description: 'Item model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Item, {includeRelations: true}),
          },
        },
      },
    },
  })
  async itemVariants(@param.path.number('id') id: number): Promise<Item> {
    return this.itemRepository.findById(id, {
      include: [
        {relation: 'itemVariants', scope: {include: ['itemVariantOptions']}},
      ],
    });
  }
  @authenticate('jwt')
  @authorize({
    allowedRoles: [AuthorizationRoles.RESTAURANT, AuthorizationRoles.ADMIN],
  })
  @patch('/items/{id}', {
    responses: {
      '204': {
        description: 'Item PATCH success',
      },
    },
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Item, {partial: true}),
        },
      },
    })
    item: Item,
  ): Promise<void> {
    await this.itemRepository.updateById(id, item);
  }
  @authenticate('jwt')
  @authorize({
    allowedRoles: [AuthorizationRoles.ADMIN],
  })
  @put('/items/{id}', {
    responses: {
      '204': {
        description: 'Item PUT success',
      },
    },
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() item: Item,
  ): Promise<void> {
    await this.itemRepository.replaceById(id, item);
  }
  @authenticate('jwt')
  @authorize({
    allowedRoles: [AuthorizationRoles.ADMIN],
  })
  @del('/items/{id}', {
    responses: {
      '204': {
        description: 'Item DELETE success',
      },
    },
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.itemRepository.deleteById(id);
  }
}
