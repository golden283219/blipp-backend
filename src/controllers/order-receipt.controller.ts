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
import {Order, Receipt} from '../models';
import {OrderRepository} from '../repositories';
import {AuthorizationRoles} from '../types/jwt';

@authenticate('jwt')
@authorize({
  allowedRoles: [AuthorizationRoles.ADMIN],
})
export class OrderReceiptController {
  constructor(
    @repository(OrderRepository) protected orderRepository: OrderRepository,
  ) {}

  @get('/orders/{id}/receipt', {
    responses: {
      '200': {
        description: 'Order has one Receipt',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Receipt),
          },
        },
      },
    },
  })
  async get(
    @param.path.number('id') id: number,
    @param.query.object('filter') filter?: Filter<Receipt>,
  ): Promise<Receipt> {
    return this.orderRepository.receipt(id).get(filter);
  }

  @post('/orders/{id}/receipt', {
    responses: {
      '200': {
        description: 'Order model instance',
        content: {'application/json': {schema: getModelSchemaRef(Receipt)}},
      },
    },
  })
  async create(
    @param.path.number('id') id: typeof Order.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Receipt, {
            title: 'NewReceiptInOrder',
            exclude: ['id'],
            optional: ['orderId'],
          }),
        },
      },
    })
    receipt: Omit<Receipt, 'id'>,
  ): Promise<Receipt> {
    return this.orderRepository.receipt(id).create(receipt);
  }

  @patch('/orders/{id}/receipt', {
    responses: {
      '200': {
        description: 'Order.Receipt PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Receipt, {partial: true}),
        },
      },
    })
    receipt: Partial<Receipt>,
    @param.query.object('where', getWhereSchemaFor(Receipt))
    where?: Where<Receipt>,
  ): Promise<Count> {
    return this.orderRepository.receipt(id).patch(receipt, where);
  }

  @del('/orders/{id}/receipt', {
    responses: {
      '200': {
        description: 'Order.Receipt DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(Receipt))
    where?: Where<Receipt>,
  ): Promise<Count> {
    return this.orderRepository.receipt(id).delete(where);
  }
}
