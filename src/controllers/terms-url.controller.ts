import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
} from '@loopback/rest';
import {TermsUrl} from '../models';
import {TermsUrlRepository} from '../repositories';

export class TermsUrlController {
  constructor(
    @repository(TermsUrlRepository)
    public termsUrlRepository : TermsUrlRepository,
  ) {}

  @post('/terms-urls', {
    responses: {
      '200': {
        description: 'TermsUrl model instance',
        content: {'application/json': {schema: getModelSchemaRef(TermsUrl)}},
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(TermsUrl, {
            title: 'NewTermsUrl',
            exclude: ['id'],
          }),
        },
      },
    })
    termsUrl: Omit<TermsUrl, 'id'>,
  ): Promise<TermsUrl> {
    return this.termsUrlRepository.create(termsUrl);
  }

  @get('/terms-urls/count', {
    responses: {
      '200': {
        description: 'TermsUrl model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.where(TermsUrl) where?: Where<TermsUrl>,
  ): Promise<Count> {
    return this.termsUrlRepository.count(where);
  }

  @get('/terms-urls', {
    responses: {
      '200': {
        description: 'Array of TermsUrl model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(TermsUrl, {includeRelations: true}),
            },
          },
        },
      },
    },
  })
  async find(
    @param.filter(TermsUrl) filter?: Filter<TermsUrl>,
  ): Promise<TermsUrl[]> {
    return this.termsUrlRepository.find(filter);
  }

  @patch('/terms-urls', {
    responses: {
      '200': {
        description: 'TermsUrl PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(TermsUrl, {partial: true}),
        },
      },
    })
    termsUrl: TermsUrl,
    @param.where(TermsUrl) where?: Where<TermsUrl>,
  ): Promise<Count> {
    return this.termsUrlRepository.updateAll(termsUrl, where);
  }

  @get('/terms-urls/{id}', {
    responses: {
      '200': {
        description: 'TermsUrl model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(TermsUrl, {includeRelations: true}),
          },
        },
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(TermsUrl, {exclude: 'where'}) filter?: FilterExcludingWhere<TermsUrl>
  ): Promise<TermsUrl> {
    return this.termsUrlRepository.findById(id, filter);
  }

  @patch('/terms-urls/{id}', {
    responses: {
      '204': {
        description: 'TermsUrl PATCH success',
      },
    },
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(TermsUrl, {partial: true}),
        },
      },
    })
    termsUrl: TermsUrl,
  ): Promise<void> {
    await this.termsUrlRepository.updateById(id, termsUrl);
  }

  @put('/terms-urls/{id}', {
    responses: {
      '204': {
        description: 'TermsUrl PUT success',
      },
    },
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() termsUrl: TermsUrl,
  ): Promise<void> {
    await this.termsUrlRepository.replaceById(id, termsUrl);
  }

  @del('/terms-urls/{id}', {
    responses: {
      '204': {
        description: 'TermsUrl DELETE success',
      },
    },
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.termsUrlRepository.deleteById(id);
  }
}
