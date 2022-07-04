import {authenticate} from '@loopback/authentication';
import {authorize} from '@loopback/authorization';
import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, param} from '@loopback/rest';
import {Order, Table} from '../models';
import {OrderRepository} from '../repositories';
import {AuthorizationRoles} from '../types/jwt';

@authenticate('jwt')
@authorize({
  allowedRoles: [AuthorizationRoles.ADMIN],
})
export class OrderTableController {
  constructor(
    @repository(OrderRepository)
    public orderRepository: OrderRepository,
  ) {}

  @get('/orders/{id}/table', {
    responses: {
      '200': {
        description: 'Table belonging to Order',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Table)},
          },
        },
      },
    },
  })
  async getTable(
    @param.path.number('id') id: typeof Order.prototype.id,
  ): Promise<Table> {
    return this.orderRepository.table(id);
  }
}
