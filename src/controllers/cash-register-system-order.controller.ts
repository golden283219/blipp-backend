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
import {CashRegisterSystem, Order} from '../models';
import {CashRegisterSystemRepository} from '../repositories';
import {AuthorizationRoles} from '../types/jwt';

@authenticate('jwt')
@authorize({
  allowedRoles: [AuthorizationRoles.ADMIN],
})
export class CashRegisterSystemOrderController {
  constructor(
    @repository(CashRegisterSystemRepository)
    protected cashRegisterSystemRepository: CashRegisterSystemRepository,
  ) {}

  @get('/cash-register-systems/{id}/orders', {
    responses: {
      '200': {
        description: 'Array of CashRegisterSystem has many Order',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Order)},
          },
        },
      },
    },
  })
  async find(
    @param.path.number('id') id: number,
    @param.query.object('filter') filter?: Filter<Order>,
  ): Promise<Order[]> {
    return this.cashRegisterSystemRepository.orders(id).find(filter);
  }

  @post('/cash-register-systems/{id}/orders', {
    responses: {
      '200': {
        description: 'CashRegisterSystem model instance',
        content: {'application/json': {schema: getModelSchemaRef(Order)}},
      },
    },
  })
  async create(
    @param.path.number('id') id: typeof CashRegisterSystem.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Order, {
            title: 'NewOrderInCashRegisterSystem',
            exclude: ['id'],
            optional: ['cashRegisterSystemId'],
          }),
        },
      },
    })
    order: Omit<Order, 'id'>,
  ): Promise<Order> {
    return this.cashRegisterSystemRepository.orders(id).create(order);
  }

  @patch('/cash-register-systems/{id}/orders', {
    responses: {
      '200': {
        description: 'CashRegisterSystem.Order PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Order, {partial: true}),
        },
      },
    })
    order: Partial<Order>,
    @param.query.object('where', getWhereSchemaFor(Order)) where?: Where<Order>,
  ): Promise<Count> {
    return this.cashRegisterSystemRepository.orders(id).patch(order, where);
  }

  @del('/cash-register-systems/{id}/orders', {
    responses: {
      '200': {
        description: 'CashRegisterSystem.Order DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(Order)) where?: Where<Order>,
  ): Promise<Count> {
    return this.cashRegisterSystemRepository.orders(id).delete(where);
  }
}
