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
import {MerchantCredentials} from '../models';
import {MerchantCredentialsRepository} from '../repositories';
import {AuthorizationRoles} from '../types/jwt';

@authenticate('jwt')
@authorize({
  allowedRoles: [AuthorizationRoles.ADMIN],
})
export class MerchantCredentialsController {
  constructor(
    @repository(MerchantCredentialsRepository)
    public merchantCredentialsRepository: MerchantCredentialsRepository,
  ) {}

  @post('/merchant-credentials', {
    responses: {
      '200': {
        description: 'MerchantCredentials model instance',
        content: {
          'application/json': {schema: getModelSchemaRef(MerchantCredentials)},
        },
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(MerchantCredentials, {
            title: 'NewMerchantCredentials',
            exclude: ['id'],
          }),
        },
      },
    })
    merchantCredentials: Omit<MerchantCredentials, 'id'>,
  ): Promise<MerchantCredentials> {
    return this.merchantCredentialsRepository.create(merchantCredentials);
  }

  @get('/merchant-credentials/count', {
    responses: {
      '200': {
        description: 'MerchantCredentials model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.where(MerchantCredentials) where?: Where<MerchantCredentials>,
  ): Promise<Count> {
    return this.merchantCredentialsRepository.count(where);
  }

  @get('/merchant-credentials', {
    responses: {
      '200': {
        description: 'Array of MerchantCredentials model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(MerchantCredentials, {
                includeRelations: true,
              }),
            },
          },
        },
      },
    },
  })
  async find(
    @param.filter(MerchantCredentials) filter?: Filter<MerchantCredentials>,
  ): Promise<MerchantCredentials[]> {
    return this.merchantCredentialsRepository.find(filter);
  }

  @patch('/merchant-credentials', {
    responses: {
      '200': {
        description: 'MerchantCredentials PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(MerchantCredentials, {partial: true}),
        },
      },
    })
    merchantCredentials: MerchantCredentials,
    @param.where(MerchantCredentials) where?: Where<MerchantCredentials>,
  ): Promise<Count> {
    return this.merchantCredentialsRepository.updateAll(
      merchantCredentials,
      where,
    );
  }

  @get('/merchant-credentials/{id}', {
    responses: {
      '200': {
        description: 'MerchantCredentials model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(MerchantCredentials, {
              includeRelations: true,
            }),
          },
        },
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(MerchantCredentials, {exclude: 'where'})
    filter?: FilterExcludingWhere<MerchantCredentials>,
  ): Promise<MerchantCredentials> {
    return this.merchantCredentialsRepository.findById(id, filter);
  }

  @patch('/merchant-credentials/{id}', {
    responses: {
      '204': {
        description: 'MerchantCredentials PATCH success',
      },
    },
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(MerchantCredentials, {partial: true}),
        },
      },
    })
    merchantCredentials: MerchantCredentials,
  ): Promise<void> {
    await this.merchantCredentialsRepository.updateById(
      id,
      merchantCredentials,
    );
  }

  @put('/merchant-credentials/{id}', {
    responses: {
      '204': {
        description: 'MerchantCredentials PUT success',
      },
    },
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() merchantCredentials: MerchantCredentials,
  ): Promise<void> {
    await this.merchantCredentialsRepository.replaceById(
      id,
      merchantCredentials,
    );
  }

  @del('/merchant-credentials/{id}', {
    responses: {
      '204': {
        description: 'MerchantCredentials DELETE success',
      },
    },
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.merchantCredentialsRepository.deleteById(id);
  }
}
