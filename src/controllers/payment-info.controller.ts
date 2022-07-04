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
import {PaymentInfo} from '../models';
import {PaymentInfoRepository} from '../repositories';
import {AuthorizationRoles} from '../types/jwt';

@authenticate('jwt')
@authorize({
  allowedRoles: [AuthorizationRoles.ADMIN],
})
export class PaymentInfoController {
  constructor(
    @repository(PaymentInfoRepository)
    public paymentInfoRepository: PaymentInfoRepository,
  ) {}

  @post('/payment-infos', {
    responses: {
      '200': {
        description: 'PaymentInfo model instance',
        content: {'application/json': {schema: getModelSchemaRef(PaymentInfo)}},
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(PaymentInfo, {
            title: 'NewPaymentInfo',
            exclude: ['id'],
          }),
        },
      },
    })
    paymentInfo: Omit<PaymentInfo, 'id'>,
  ): Promise<PaymentInfo> {
    return this.paymentInfoRepository.create(paymentInfo);
  }

  @get('/payment-infos/count', {
    responses: {
      '200': {
        description: 'PaymentInfo model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.where(PaymentInfo) where?: Where<PaymentInfo>,
  ): Promise<Count> {
    return this.paymentInfoRepository.count(where);
  }

  @get('/payment-infos', {
    responses: {
      '200': {
        description: 'Array of PaymentInfo model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(PaymentInfo, {includeRelations: true}),
            },
          },
        },
      },
    },
  })
  async find(
    @param.filter(PaymentInfo) filter?: Filter<PaymentInfo>,
  ): Promise<PaymentInfo[]> {
    return this.paymentInfoRepository.find(filter);
  }

  @patch('/payment-infos', {
    responses: {
      '200': {
        description: 'PaymentInfo PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(PaymentInfo, {partial: true}),
        },
      },
    })
    paymentInfo: PaymentInfo,
    @param.where(PaymentInfo) where?: Where<PaymentInfo>,
  ): Promise<Count> {
    return this.paymentInfoRepository.updateAll(paymentInfo, where);
  }

  @get('/payment-infos/{id}', {
    responses: {
      '200': {
        description: 'PaymentInfo model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(PaymentInfo, {includeRelations: true}),
          },
        },
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(PaymentInfo, {exclude: 'where'})
    filter?: FilterExcludingWhere<PaymentInfo>,
  ): Promise<PaymentInfo> {
    return this.paymentInfoRepository.findById(id, filter);
  }

  @patch('/payment-infos/{id}', {
    responses: {
      '204': {
        description: 'PaymentInfo PATCH success',
      },
    },
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(PaymentInfo, {partial: true}),
        },
      },
    })
    paymentInfo: PaymentInfo,
  ): Promise<void> {
    await this.paymentInfoRepository.updateById(id, paymentInfo);
  }

  @put('/payment-infos/{id}', {
    responses: {
      '204': {
        description: 'PaymentInfo PUT success',
      },
    },
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() paymentInfo: PaymentInfo,
  ): Promise<void> {
    await this.paymentInfoRepository.replaceById(id, paymentInfo);
  }

  @del('/payment-infos/{id}', {
    responses: {
      '204': {
        description: 'PaymentInfo DELETE success',
      },
    },
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.paymentInfoRepository.deleteById(id);
  }
}
