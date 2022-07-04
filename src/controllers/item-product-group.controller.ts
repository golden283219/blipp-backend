import {authenticate} from '@loopback/authentication';
import {authorize} from '@loopback/authorization';
import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, param} from '@loopback/rest';
import {Item, ProductGroup} from '../models';
import {ItemRepository} from '../repositories';
import {AuthorizationRoles} from '../types/jwt';

@authenticate('jwt')
@authorize({
  allowedRoles: [AuthorizationRoles.ADMIN],
})
export class ItemProductGroupController {
  constructor(
    @repository(ItemRepository)
    public itemRepository: ItemRepository,
  ) {}

  @get('/items/{id}/product-group', {
    responses: {
      '200': {
        description: 'ProductGroup belonging to Item',
        content: {
          'application/json': {
            schema: getModelSchemaRef(ProductGroup, {includeRelations: true}),
          },
        },
      },
    },
  })
  async getProductGroup(
    @param.path.number('id') id: typeof Item.prototype.id,
  ): Promise<ProductGroup> {
    return this.itemRepository.productGroup(id);
  }
}
