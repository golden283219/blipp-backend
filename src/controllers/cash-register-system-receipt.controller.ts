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
import {CashRegisterSystem, Receipt} from '../models';
import {CashRegisterSystemRepository} from '../repositories';
import {AuthorizationRoles} from '../types/jwt';

@authenticate('jwt')
@authorize({
  allowedRoles: [AuthorizationRoles.ADMIN],
})
export class CashRegisterSystemReceiptController {
  constructor(
    @repository(CashRegisterSystemRepository)
    protected cashRegisterSystemRepository: CashRegisterSystemRepository,
  ) {}

  @get('/cash-register-systems/{id}/receipts', {
    responses: {
      '200': {
        description: 'Array of CashRegisterSystem has many Receipt',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Receipt)},
          },
        },
      },
    },
  })
  async find(
    @param.path.number('id') id: number,
    @param.query.object('filter') filter?: Filter<Receipt>,
  ): Promise<Receipt[]> {
    return this.cashRegisterSystemRepository.receipts(id).find(filter);
  }

  @post('/cash-register-systems/{id}/receipts', {
    responses: {
      '200': {
        description: 'CashRegisterSystem model instance',
        content: {'application/json': {schema: getModelSchemaRef(Receipt)}},
      },
    },
  })
  async create(
    @param.path.number('id') id: typeof CashRegisterSystem.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Receipt, {
            title: 'NewReceiptInCashRegisterSystem',
            exclude: ['id'],
            optional: ['cashRegisterSystemId'],
          }),
        },
      },
    })
    receipt: Omit<Receipt, 'id'>,
  ): Promise<Receipt> {
    return this.cashRegisterSystemRepository.receipts(id).create(receipt);
  }

  @patch('/cash-register-systems/{id}/receipts', {
    responses: {
      '200': {
        description: 'CashRegisterSystem.Receipt PATCH success count',
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
    return this.cashRegisterSystemRepository.receipts(id).patch(receipt, where);
  }

  @del('/cash-register-systems/{id}/receipts', {
    responses: {
      '200': {
        description: 'CashRegisterSystem.Receipt DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(Receipt))
    where?: Where<Receipt>,
  ): Promise<Count> {
    return this.cashRegisterSystemRepository.receipts(id).delete(where);
  }
}
