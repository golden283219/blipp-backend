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
import {SubcategoryOrderType} from '../models';
import {SubcategoryOrderTypeRepository} from '../repositories';
import {AuthorizationRoles} from '../types/jwt';

@authenticate('jwt')
@authorize({
  allowedRoles: [AuthorizationRoles.ADMIN],
})
export class SubcategoryOrderTypeController {
  constructor(
    @repository(SubcategoryOrderTypeRepository)
    public subcategoryOrderTypeRepository: SubcategoryOrderTypeRepository,
  ) {}

  @post('/subcategory-order-types', {
    responses: {
      '200': {
        description: 'SubcategoryOrderType model instance',
        content: {
          'application/json': {schema: getModelSchemaRef(SubcategoryOrderType)},
        },
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(SubcategoryOrderType, {
            title: 'NewSubcategoryOrderType',
            exclude: ['id'],
          }),
        },
      },
    })
    subcategoryOrderType: Omit<SubcategoryOrderType, 'id'>,
  ): Promise<SubcategoryOrderType> {
    return this.subcategoryOrderTypeRepository.create(subcategoryOrderType);
  }

  @get('/subcategory-order-types/count', {
    responses: {
      '200': {
        description: 'SubcategoryOrderType model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.where(SubcategoryOrderType) where?: Where<SubcategoryOrderType>,
  ): Promise<Count> {
    return this.subcategoryOrderTypeRepository.count(where);
  }

  @get('/subcategory-order-types', {
    responses: {
      '200': {
        description: 'Array of SubcategoryOrderType model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(SubcategoryOrderType, {
                includeRelations: true,
              }),
            },
          },
        },
      },
    },
  })
  async find(
    @param.filter(SubcategoryOrderType) filter?: Filter<SubcategoryOrderType>,
  ): Promise<SubcategoryOrderType[]> {
    return this.subcategoryOrderTypeRepository.find(filter);
  }

  @patch('/subcategory-order-types', {
    responses: {
      '200': {
        description: 'SubcategoryOrderType PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(SubcategoryOrderType, {partial: true}),
        },
      },
    })
    subcategoryOrderType: SubcategoryOrderType,
    @param.where(SubcategoryOrderType) where?: Where<SubcategoryOrderType>,
  ): Promise<Count> {
    return this.subcategoryOrderTypeRepository.updateAll(
      subcategoryOrderType,
      where,
    );
  }

  @get('/subcategory-order-types/{id}', {
    responses: {
      '200': {
        description: 'SubcategoryOrderType model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(SubcategoryOrderType, {
              includeRelations: true,
            }),
          },
        },
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(SubcategoryOrderType, {exclude: 'where'})
    filter?: FilterExcludingWhere<SubcategoryOrderType>,
  ): Promise<SubcategoryOrderType> {
    return this.subcategoryOrderTypeRepository.findById(id, filter);
  }

  @patch('/subcategory-order-types/{id}', {
    responses: {
      '204': {
        description: 'SubcategoryOrderType PATCH success',
      },
    },
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(SubcategoryOrderType, {partial: true}),
        },
      },
    })
    subcategoryOrderType: SubcategoryOrderType,
  ): Promise<void> {
    await this.subcategoryOrderTypeRepository.updateById(
      id,
      subcategoryOrderType,
    );
  }

  @put('/subcategory-order-types/{id}', {
    responses: {
      '204': {
        description: 'SubcategoryOrderType PUT success',
      },
    },
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() subcategoryOrderType: SubcategoryOrderType,
  ): Promise<void> {
    await this.subcategoryOrderTypeRepository.replaceById(
      id,
      subcategoryOrderType,
    );
  }

  @del('/subcategory-order-types/{id}', {
    responses: {
      '204': {
        description: 'SubcategoryOrderType DELETE success',
      },
    },
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.subcategoryOrderTypeRepository.deleteById(id);
  }
}
