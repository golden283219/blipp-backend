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
  response,
} from '@loopback/rest';
import {DeliveryCost} from '../models';
import {DeliveryCostRepository} from '../repositories';

export class DeliveryCostController {
  constructor(
    @repository(DeliveryCostRepository)
    public deliveryCostRepository : DeliveryCostRepository,
  ) {}

  @post('/delivery-costs')
  @response(200, {
    description: 'DeliveryCost model instance',
    content: {'application/json': {schema: getModelSchemaRef(DeliveryCost)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(DeliveryCost, {
            title: 'NewDeliveryCost',
            exclude: ['id'],
          }),
        },
      },
    })
    deliveryCost: Omit<DeliveryCost, 'id'>,
  ): Promise<DeliveryCost> {
    return this.deliveryCostRepository.create(deliveryCost);
  }

  @get('/delivery-costs/count')
  @response(200, {
    description: 'DeliveryCost model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(DeliveryCost) where?: Where<DeliveryCost>,
  ): Promise<Count> {
    return this.deliveryCostRepository.count(where);
  }

  @get('/delivery-costs')
  @response(200, {
    description: 'Array of DeliveryCost model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(DeliveryCost, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(DeliveryCost) filter?: Filter<DeliveryCost>,
  ): Promise<DeliveryCost[]> {
    return this.deliveryCostRepository.find(filter);
  }

  @patch('/delivery-costs')
  @response(200, {
    description: 'DeliveryCost PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(DeliveryCost, {partial: true}),
        },
      },
    })
    deliveryCost: DeliveryCost,
    @param.where(DeliveryCost) where?: Where<DeliveryCost>,
  ): Promise<Count> {
    return this.deliveryCostRepository.updateAll(deliveryCost, where);
  }

  @get('/delivery-costs/{id}')
  @response(200, {
    description: 'DeliveryCost model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(DeliveryCost, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(DeliveryCost, {exclude: 'where'}) filter?: FilterExcludingWhere<DeliveryCost>
  ): Promise<DeliveryCost> {
    return this.deliveryCostRepository.findById(id, filter);
  }

  @patch('/delivery-costs/{id}')
  @response(204, {
    description: 'DeliveryCost PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(DeliveryCost, {partial: true}),
        },
      },
    })
    deliveryCost: DeliveryCost,
  ): Promise<void> {
    await this.deliveryCostRepository.updateById(id, deliveryCost);
  }

  @put('/delivery-costs/{id}')
  @response(204, {
    description: 'DeliveryCost PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() deliveryCost: DeliveryCost,
  ): Promise<void> {
    await this.deliveryCostRepository.replaceById(id, deliveryCost);
  }

  @del('/delivery-costs/{id}')
  @response(204, {
    description: 'DeliveryCost DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.deliveryCostRepository.deleteById(id);
  }
}
