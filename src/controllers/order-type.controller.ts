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
import {OrderType} from '../models';
import {OrderTypeRepository} from '../repositories';
import {AuthorizationRoles} from '../types/jwt';

@authenticate('jwt')
@authorize({
  allowedRoles: [AuthorizationRoles.ADMIN],
})
export class OrderTypeController {
  constructor(
    @repository(OrderTypeRepository)
    public orderTypeRepository: OrderTypeRepository,
  ) {}

  @post('/order-types', {
    responses: {
      '200': {
        description: 'OrderType model instance',
        content: {'application/json': {schema: getModelSchemaRef(OrderType)}},
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(OrderType, {
            title: 'NewOrderType',
            exclude: ['id'],
          }),
        },
      },
    })
    orderType: Omit<OrderType, 'id'>,
  ): Promise<OrderType> {
    return this.orderTypeRepository.create(orderType);
  }

  @get('/order-types/count', {
    responses: {
      '200': {
        description: 'OrderType model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.where(OrderType) where?: Where<OrderType>,
  ): Promise<Count> {
    return this.orderTypeRepository.count(where);
  }

  @get('/order-types', {
    responses: {
      '200': {
        description: 'Array of OrderType model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(OrderType, {includeRelations: true}),
            },
          },
        },
      },
    },
  })
  async find(
    @param.filter(OrderType) filter?: Filter<OrderType>,
  ): Promise<OrderType[]> {
    return this.orderTypeRepository.find({
      ...filter,
      include: ['itemSubcategories', 'items'],
    });
  }

  @patch('/order-types', {
    responses: {
      '200': {
        description: 'OrderType PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(OrderType, {partial: true}),
        },
      },
    })
    orderType: OrderType,
    @param.where(OrderType) where?: Where<OrderType>,
  ): Promise<Count> {
    return this.orderTypeRepository.updateAll(orderType, where);
  }

  @get('/order-types/{id}', {
    responses: {
      '200': {
        description: 'OrderType model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(OrderType, {includeRelations: true}),
          },
        },
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(OrderType, {exclude: 'where'})
    filter?: FilterExcludingWhere<OrderType>,
  ): Promise<OrderType> {
    return this.orderTypeRepository.findById(id, {
      ...filter,
      include: ['itemSubcategories', 'items'],
    });
  }

  @patch('/order-types/{id}', {
    responses: {
      '204': {
        description: 'OrderType PATCH success',
      },
    },
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(OrderType, {partial: true}),
        },
      },
    })
    orderType: OrderType,
  ): Promise<void> {
    await this.orderTypeRepository.updateById(id, orderType);
  }

  @put('/order-types/{id}', {
    responses: {
      '204': {
        description: 'OrderType PUT success',
      },
    },
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() orderType: OrderType,
  ): Promise<void> {
    await this.orderTypeRepository.replaceById(id, orderType);
  }

  @del('/order-types/{id}', {
    responses: {
      '204': {
        description: 'OrderType DELETE success',
      },
    },
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.orderTypeRepository.deleteById(id);
  }
}
