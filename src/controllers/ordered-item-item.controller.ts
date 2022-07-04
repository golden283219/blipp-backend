import {authenticate} from '@loopback/authentication';
import {authorize} from '@loopback/authorization';
import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, param} from '@loopback/rest';
import {Item, OrderedItem} from '../models';
import {OrderedItemRepository} from '../repositories';
import {AuthorizationRoles} from '../types/jwt';

@authenticate('jwt')
@authorize({
  allowedRoles: [AuthorizationRoles.ADMIN],
})
export class OrderedItemItemController {
  constructor(
    @repository(OrderedItemRepository)
    public orderedItemRepository: OrderedItemRepository,
  ) {}

  @get('/ordered-items/{id}/item', {
    responses: {
      '200': {
        description: 'Item belonging to OrderedItem',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Item)},
          },
        },
      },
    },
  })
  async getItem(
    @param.path.number('id') id: typeof OrderedItem.prototype.id,
  ): Promise<Item> {
    return this.orderedItemRepository.item(id);
  }
}
