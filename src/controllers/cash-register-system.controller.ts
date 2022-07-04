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
import {CashRegisterSystem} from '../models/cash-register-system.model';
import {CashRegisterSystemRepository} from '../repositories/cash-register-system.repository';
import {AuthorizationRoles} from '../types/jwt';

@authenticate('jwt')
@authorize({
  allowedRoles: [AuthorizationRoles.ADMIN],
})
export class CashRegisterSystemController {
  constructor(
    @repository(CashRegisterSystemRepository)
    public cashRegisterSystemRepository: CashRegisterSystemRepository,
  ) {}

  @post('/cash-register-systems', {
    responses: {
      '200': {
        description: 'CashRegisterSystem model instance',
        content: {
          'application/json': {schema: getModelSchemaRef(CashRegisterSystem)},
        },
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(CashRegisterSystem, {
            title: 'NewCashRegisterSystem',
            exclude: ['id'],
          }),
        },
      },
    })
    cashRegisterSystem: Omit<CashRegisterSystem, 'id'>,
  ): Promise<CashRegisterSystem> {
    return this.cashRegisterSystemRepository.create(cashRegisterSystem);
  }

  @get('/cash-register-systems/count', {
    responses: {
      '200': {
        description: 'CashRegisterSystem model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.where(CashRegisterSystem) where?: Where<CashRegisterSystem>,
  ): Promise<Count> {
    return this.cashRegisterSystemRepository.count(where);
  }

  @get('/cash-register-systems', {
    responses: {
      '200': {
        description: 'Array of CashRegisterSystem model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(CashRegisterSystem, {
                includeRelations: true,
              }),
            },
          },
        },
      },
    },
  })
  async find(
    @param.filter(CashRegisterSystem) filter?: Filter<CashRegisterSystem>,
  ): Promise<CashRegisterSystem[]> {
    return this.cashRegisterSystemRepository.find({
      ...filter,
      include: ['receipts', 'orders'],
    });
  }

  @patch('/cash-register-systems', {
    responses: {
      '200': {
        description: 'CashRegisterSystem PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(CashRegisterSystem, {partial: true}),
        },
      },
    })
    cashRegisterSystem: CashRegisterSystem,
    @param.where(CashRegisterSystem) where?: Where<CashRegisterSystem>,
  ): Promise<Count> {
    return this.cashRegisterSystemRepository.updateAll(
      cashRegisterSystem,
      where,
    );
  }

  @get('/cash-register-systems/{id}', {
    responses: {
      '200': {
        description: 'CashRegisterSystem model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(CashRegisterSystem, {
              includeRelations: true,
            }),
          },
        },
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(CashRegisterSystem, {exclude: 'where'})
    filter?: FilterExcludingWhere<CashRegisterSystem>,
  ): Promise<CashRegisterSystem> {
    return this.cashRegisterSystemRepository.findById(id, filter);
  }

  @patch('/cash-register-systems/{id}', {
    responses: {
      '204': {
        description: 'CashRegisterSystem PATCH success',
      },
    },
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(CashRegisterSystem, {partial: true}),
        },
      },
    })
    cashRegisterSystem: CashRegisterSystem,
  ): Promise<void> {
    await this.cashRegisterSystemRepository.updateById(id, cashRegisterSystem);
  }

  @put('/cash-register-systems/{id}', {
    responses: {
      '204': {
        description: 'CashRegisterSystem PUT success',
      },
    },
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() cashRegisterSystem: CashRegisterSystem,
  ): Promise<void> {
    await this.cashRegisterSystemRepository.replaceById(id, cashRegisterSystem);
  }

  @del('/cash-register-systems/{id}', {
    responses: {
      '204': {
        description: 'CashRegisterSystem DELETE success',
      },
    },
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.cashRegisterSystemRepository.deleteById(id);
  }
}
