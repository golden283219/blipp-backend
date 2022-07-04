import {authenticate} from '@loopback/authentication';
import {authorize} from '@loopback/authorization';
import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, param} from '@loopback/rest';
import {ItemVariant, ItemVariantOption} from '../models';
import {ItemVariantOptionRepository} from '../repositories';
import {AuthorizationRoles} from '../types/jwt';

@authenticate('jwt')
@authorize({
  allowedRoles: [AuthorizationRoles.ADMIN],
})
export class ItemVariantOptionItemVariantController {
  constructor(
    @repository(ItemVariantOptionRepository)
    public itemVariantOptionRepository: ItemVariantOptionRepository,
  ) {}

  @get('/item-variant-options/{id}/item-variant', {
    responses: {
      '200': {
        description: 'ItemVariant belonging to ItemVariantOption',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(ItemVariant)},
          },
        },
      },
    },
  })
  async getItemVariant(
    @param.path.number('id') id: typeof ItemVariantOption.prototype.id,
  ): Promise<ItemVariant> {
    return this.itemVariantOptionRepository.itemVariant(id);
  }
}
