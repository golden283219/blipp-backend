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
import {ProductGroup} from '../models';
import {ProductGroupRepository} from '../repositories';
import {AuthorizationRoles} from '../types/jwt';

@authenticate('jwt')
@authorize({
  allowedRoles: [AuthorizationRoles.ADMIN],
})
export class ProductGroupController {
  constructor(
    @repository(ProductGroupRepository)
    public productGroupRepository: ProductGroupRepository,
  ) {}

  @post('/product-groups', {
    responses: {
      '200': {
        description: 'ProductGroup model instance',
        content: {
          'application/json': {schema: getModelSchemaRef(ProductGroup)},
        },
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ProductGroup, {
            title: 'NewProductGroup',
            exclude: ['id'],
          }),
        },
      },
    })
    productGroup: Omit<ProductGroup, 'id'>,
  ): Promise<ProductGroup> {
    return this.productGroupRepository.create(productGroup);
  }

  @get('/product-groups/count', {
    responses: {
      '200': {
        description: 'ProductGroup model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.where(ProductGroup) where?: Where<ProductGroup>,
  ): Promise<Count> {
    return this.productGroupRepository.count(where);
  }

  @get('/product-groups', {
    responses: {
      '200': {
        description: 'Array of ProductGroup model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(ProductGroup, {includeRelations: true}),
            },
          },
        },
      },
    },
  })
  async find(
    @param.filter(ProductGroup) filter?: Filter<ProductGroup>,
  ): Promise<ProductGroup[]> {
    return this.productGroupRepository.find(filter);
  }

  @patch('/product-groups', {
    responses: {
      '200': {
        description: 'ProductGroup PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ProductGroup, {partial: true}),
        },
      },
    })
    productGroup: ProductGroup,
    @param.where(ProductGroup) where?: Where<ProductGroup>,
  ): Promise<Count> {
    return this.productGroupRepository.updateAll(productGroup, where);
  }

  @get('/product-groups/{id}', {
    responses: {
      '200': {
        description: 'ProductGroup model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(ProductGroup, {includeRelations: true}),
          },
        },
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(ProductGroup, {exclude: 'where'})
    filter?: FilterExcludingWhere<ProductGroup>,
  ): Promise<ProductGroup> {
    return this.productGroupRepository.findById(id, filter);
  }

  @patch('/product-groups/{id}', {
    responses: {
      '204': {
        description: 'ProductGroup PATCH success',
      },
    },
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ProductGroup, {partial: true}),
        },
      },
    })
    productGroup: ProductGroup,
  ): Promise<void> {
    await this.productGroupRepository.updateById(id, productGroup);
  }

  @put('/product-groups/{id}', {
    responses: {
      '204': {
        description: 'ProductGroup PUT success',
      },
    },
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() productGroup: ProductGroup,
  ): Promise<void> {
    await this.productGroupRepository.replaceById(id, productGroup);
  }

  @del('/product-groups/{id}', {
    responses: {
      '204': {
        description: 'ProductGroup DELETE success',
      },
    },
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.productGroupRepository.deleteById(id);
  }
}
