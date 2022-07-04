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
import {Customer, Receipt} from '../models';
import {CustomerRepository} from '../repositories';
import {AuthorizationRoles} from '../types/jwt';
@authenticate('jwt')
@authorize({
  allowedRoles: [AuthorizationRoles.ADMIN],
})
export class CustomerReceiptController {
  constructor(
    @repository(CustomerRepository)
    protected customerRepository: CustomerRepository,
  ) {}

  @get('/customers/{id}/receipts', {
    responses: {
      '200': {
        description: 'Array of Customer has many Receipt',
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
    return this.customerRepository.receipts(id).find(filter);
  }

  @post('/customers/{id}/receipts', {
    responses: {
      '200': {
        description: 'Customer model instance',
        content: {'application/json': {schema: getModelSchemaRef(Receipt)}},
      },
    },
  })
  async create(
    @param.path.number('id') id: typeof Customer.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Receipt, {
            title: 'NewReceiptInCustomer',
            exclude: ['id'],
            optional: ['customerId'],
          }),
        },
      },
    })
    receipt: Omit<Receipt, 'id'>,
  ): Promise<Receipt> {
    return this.customerRepository.receipts(id).create(receipt);
  }

  @patch('/customers/{id}/receipts', {
    responses: {
      '200': {
        description: 'Customer.Receipt PATCH success count',
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
    return this.customerRepository.receipts(id).patch(receipt, where);
  }

  @del('/customers/{id}/receipts', {
    responses: {
      '200': {
        description: 'Customer.Receipt DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(Receipt))
    where?: Where<Receipt>,
  ): Promise<Count> {
    return this.customerRepository.receipts(id).delete(where);
  }
}
