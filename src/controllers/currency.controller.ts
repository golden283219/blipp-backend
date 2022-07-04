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
import {Currency} from '../models';
import {CurrencyRepository} from '../repositories';
import {AuthorizationRoles} from '../types/jwt';

@authenticate('jwt')
@authorize({
  allowedRoles: [AuthorizationRoles.ADMIN],
})
export class CurrencyController {
  constructor(
    @repository(CurrencyRepository)
    public currencyRepository: CurrencyRepository,
  ) {}

  @post('/currencies', {
    responses: {
      '200': {
        description: 'Currency model instance',
        content: {'application/json': {schema: getModelSchemaRef(Currency)}},
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Currency, {
            title: 'NewCurrency',
            exclude: ['id'],
          }),
        },
      },
    })
    currency: Omit<Currency, 'id'>,
  ): Promise<Currency> {
    return this.currencyRepository.create(currency);
  }

  @get('/currencies/count', {
    responses: {
      '200': {
        description: 'Currency model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(@param.where(Currency) where?: Where<Currency>): Promise<Count> {
    return this.currencyRepository.count(where);
  }

  @get('/currencies', {
    responses: {
      '200': {
        description: 'Array of Currency model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Currency, {includeRelations: true}),
            },
          },
        },
      },
    },
  })
  async find(
    @param.filter(Currency) filter?: Filter<Currency>,
  ): Promise<Currency[]> {
    return this.currencyRepository.find(filter);
  }

  @patch('/currencies', {
    responses: {
      '200': {
        description: 'Currency PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Currency, {partial: true}),
        },
      },
    })
    currency: Currency,
    @param.where(Currency) where?: Where<Currency>,
  ): Promise<Count> {
    return this.currencyRepository.updateAll(currency, where);
  }

  @get('/currencies/{id}', {
    responses: {
      '200': {
        description: 'Currency model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Currency, {includeRelations: true}),
          },
        },
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Currency, {exclude: 'where'})
    filter?: FilterExcludingWhere<Currency>,
  ): Promise<Currency> {
    return this.currencyRepository.findById(id, filter);
  }

  @patch('/currencies/{id}', {
    responses: {
      '204': {
        description: 'Currency PATCH success',
      },
    },
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Currency, {partial: true}),
        },
      },
    })
    currency: Currency,
  ): Promise<void> {
    await this.currencyRepository.updateById(id, currency);
  }

  @put('/currencies/{id}', {
    responses: {
      '204': {
        description: 'Currency PUT success',
      },
    },
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() currency: Currency,
  ): Promise<void> {
    await this.currencyRepository.replaceById(id, currency);
  }

  @del('/currencies/{id}', {
    responses: {
      '204': {
        description: 'Currency DELETE success',
      },
    },
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.currencyRepository.deleteById(id);
  }
}
