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
import {CashRegisterSystem, Restaurant} from '../models';
import {RestaurantRepository} from '../repositories';
import {AuthorizationRoles} from '../types/jwt';

@authenticate('jwt')
@authorize({
  allowedRoles: [AuthorizationRoles.ADMIN],
})
export class RestaurantCashRegisterSystemController {
  constructor(
    @repository(RestaurantRepository)
    protected restaurantRepository: RestaurantRepository,
  ) {}

  @get('/restaurants/{id}/cash-register-systems', {
    responses: {
      '200': {
        description: 'Array of Restaurant has many CashRegisterSystem',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(CashRegisterSystem),
            },
          },
        },
      },
    },
  })
  async find(
    @param.path.number('id') id: number,
    @param.query.object('filter') filter?: Filter<CashRegisterSystem>,
  ): Promise<CashRegisterSystem[]> {
    return this.restaurantRepository.cashRegisterSystems(id).find(filter);
  }

  @post('/restaurants/{id}/cash-register-systems', {
    responses: {
      '200': {
        description: 'Restaurant model instance',
        content: {
          'application/json': {schema: getModelSchemaRef(CashRegisterSystem)},
        },
      },
    },
  })
  async create(
    @param.path.number('id') id: typeof Restaurant.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(CashRegisterSystem, {
            title: 'NewCashRegisterSystemInRestaurant',
            exclude: ['id'],
            optional: ['restaurantId'],
          }),
        },
      },
    })
    cashRegisterSystem: Omit<CashRegisterSystem, 'id'>,
  ): Promise<CashRegisterSystem> {
    return this.restaurantRepository
      .cashRegisterSystems(id)
      .create(cashRegisterSystem);
  }

  @patch('/restaurants/{id}/cash-register-systems', {
    responses: {
      '200': {
        description: 'Restaurant.CashRegisterSystem PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(CashRegisterSystem, {partial: true}),
        },
      },
    })
    cashRegisterSystem: Partial<CashRegisterSystem>,
    @param.query.object('where', getWhereSchemaFor(CashRegisterSystem))
    where?: Where<CashRegisterSystem>,
  ): Promise<Count> {
    return this.restaurantRepository
      .cashRegisterSystems(id)
      .patch(cashRegisterSystem, where);
  }

  @del('/restaurants/{id}/cash-register-systems', {
    responses: {
      '200': {
        description: 'Restaurant.CashRegisterSystem DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(CashRegisterSystem))
    where?: Where<CashRegisterSystem>,
  ): Promise<Count> {
    return this.restaurantRepository.cashRegisterSystems(id).delete(where);
  }
}
