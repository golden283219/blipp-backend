import {authenticate} from '@loopback/authentication';
import {authorize} from '@loopback/authorization';
import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  getWhereSchemaFor,
  param,
  patch,
  post,
  requestBody,
} from '@loopback/rest';
import {Order, PaymentInfo} from '../models';
import {OrderRepository} from '../repositories';
import {AuthorizationRoles} from '../types/jwt';

@authenticate('jwt')
@authorize({
  allowedRoles: [AuthorizationRoles.ADMIN],
})
export class OrderPaymentInfoController {
  constructor(
    @repository(OrderRepository) protected orderRepository: OrderRepository,
  ) {}

  @get('/orders/{id}/payment-info', {
    responses: {
      '200': {
        description: 'Order has one PaymentInfo',
        content: {
          'application/json': {
            schema: getModelSchemaRef(PaymentInfo),
          },
        },
      },
    },
  })
  async get(
    @param.path.number('id') id: number,
    @param.query.object('filter') filter?: Filter<PaymentInfo>,
  ): Promise<PaymentInfo> {
    return this.orderRepository.paymentInfo(id).get(filter);
  }

  @post('/orders/{id}/payment-info', {
    responses: {
      '200': {
        description: 'Order model instance',
        content: {'application/json': {schema: getModelSchemaRef(PaymentInfo)}},
      },
    },
  })
  async create(
    @param.path.number('id') id: typeof Order.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(PaymentInfo, {
            title: 'NewPaymentInfoInOrder',
            exclude: ['id'],
            optional: ['orderId'],
          }),
        },
      },
    })
    paymentInfo: Omit<PaymentInfo, 'id'>,
  ): Promise<PaymentInfo> {
    return this.orderRepository.paymentInfo(id).create(paymentInfo);
  }

  @patch('/orders/{id}/payment-info', {
    responses: {
      '200': {
        description: 'Order.PaymentInfo PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(PaymentInfo, {partial: true}),
        },
      },
    })
    paymentInfo: Partial<PaymentInfo>,
    @param.query.object('where', getWhereSchemaFor(PaymentInfo))
    where?: Where<PaymentInfo>,
  ): Promise<Count> {
    return this.orderRepository.paymentInfo(id).patch(paymentInfo, where);
  }

  @del('/orders/{id}/payment-info', {
    responses: {
      '200': {
        description: 'Order.PaymentInfo DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(PaymentInfo))
    where?: Where<PaymentInfo>,
  ): Promise<Count> {
    return this.orderRepository.paymentInfo(id).delete(where);
  }
}
