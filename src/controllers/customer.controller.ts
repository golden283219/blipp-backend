import {authenticate, TokenService} from '@loopback/authentication';
import {authorize} from '@loopback/authorization';
import {inject} from '@loopback/core';
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
import {TokenServiceBindings} from '../keys';
import {Customer} from '../models';
import {CustomerRepository} from '../repositories';
import {CustomerService} from '../services/customer-service';
import {AuthorizationRoles} from '../types/jwt';

export class CustomerController {
  constructor(
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: TokenService,
    @repository(CustomerRepository)
    public customerRepository: CustomerRepository,
  ) {}

  @post('/customers', {
    responses: {
      '200': {
        description: 'Customer model instance',
        content: {'application/json': {schema: getModelSchemaRef(Customer)}},
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Customer, {
            title: 'NewCustomer',
            exclude: ['id'],
          }),
        },
      },
    })
    customer: Omit<Customer, 'id'>,
  ): Promise<Customer | null> {
    if (customer.messengerId) {
      const existingCustomer = await this.customerRepository.findOne({
        where: {messengerId: customer?.messengerId},
      });
      if (existingCustomer) return null;
    }
    return this.customerRepository.create(customer);
  }

  @authenticate('jwt')
  @authorize({
    allowedRoles: [AuthorizationRoles.ADMIN],
  })
  @get('/customers/count', {
    responses: {
      '200': {
        description: 'Customer model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(@param.where(Customer) where?: Where<Customer>): Promise<Count> {
    return this.customerRepository.count(where);
  }

  @get('/customers/validate/{messengerId}', {
    responses: {
      '200': {
        description: 'Authenticated',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Customer, {
              exclude: [
                'firstName',
                'lastName',
                'messengerId',
                'orders',
                'receipts',
              ],
            }),
          },
        },
      },
    },
  })
  async validateCustomer(
    @param.path.number('messengerId') messengerId: number,
  ): Promise<Customer | null> {
    const existingCustomer = await this.customerRepository.findOne({
      where: {messengerId: messengerId.toString()},
    });
    if (!existingCustomer) return null;

    return existingCustomer;
  }

  @get('/getToken/{id}', {
    responses: {
      '200': {
        description: 'Get token',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                token: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
  })
  async getToken(
    @param.path.number('id') id: number,
  ): Promise<{token: String} | null> {
    const existingCustomer = await this.customerRepository.findById(id);
    if (!existingCustomer) return null;
    const customerService = new CustomerService();
    const userProfile = customerService.convertToUserProfile(existingCustomer);
    const token = await this.jwtService.generateToken(userProfile);
    return {token};
  }

  @authenticate('jwt')
  @authorize({
    allowedRoles: [AuthorizationRoles.ADMIN],
  })
  @get('/customers', {
    responses: {
      '200': {
        description: 'Array of Customer model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Customer, {includeRelations: true}),
            },
          },
        },
      },
    },
  })
  async find(
    @param.filter(Customer) filter?: Filter<Customer>,
  ): Promise<Customer[]> {
    return this.customerRepository.find(filter);
  }

  @authenticate('jwt')
  @authorize({
    allowedRoles: [AuthorizationRoles.ADMIN],
  })
  @patch('/customers', {
    responses: {
      '200': {
        description: 'Customer PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Customer, {partial: true}),
        },
      },
    })
    customer: Customer,
    @param.where(Customer) where?: Where<Customer>,
  ): Promise<Count> {
    return this.customerRepository.updateAll(customer, where);
  }

  @authenticate('jwt')
  @authorize({
    allowedRoles: [AuthorizationRoles.ADMIN],
  })
  @get('/customers/{id}', {
    operationId: 'getCustomer',
    responses: {
      '200': {
        description: 'Customer model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Customer, {includeRelations: true}),
          },
        },
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Customer, {exclude: 'where'})
    filter?: FilterExcludingWhere<Customer>,
  ): Promise<Customer> {
    return this.customerRepository.findById(id, filter);
  }

  @authenticate('jwt')
  @authorize({
    allowedRoles: [AuthorizationRoles.ADMIN],
  })
  @patch('/customers/{id}', {
    responses: {
      '204': {
        description: 'Customer PATCH success',
      },
    },
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Customer, {partial: true}),
        },
      },
    })
    customer: Customer,
  ): Promise<void> {
    await this.customerRepository.updateById(id, customer);
  }

  @authenticate('jwt')
  @authorize({
    allowedRoles: [AuthorizationRoles.ADMIN],
  })
  @put('/customers/{id}', {
    responses: {
      '204': {
        description: 'Customer PUT success',
      },
    },
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() customer: Customer,
  ): Promise<void> {
    await this.customerRepository.replaceById(id, customer);
  }

  @authenticate('jwt')
  @authorize({
    allowedRoles: [AuthorizationRoles.ADMIN],
  })
  @del('/customers/{id}', {
    responses: {
      '204': {
        description: 'Customer DELETE success',
      },
    },
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.customerRepository.deleteById(id);
  }
}
