import {authenticate} from '@loopback/authentication';
import {authorize} from '@loopback/authorization';
import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, param} from '@loopback/rest';
import {Customer, Receipt} from '../models';
import {ReceiptRepository} from '../repositories';
import {AuthorizationRoles} from '../types/jwt';

@authenticate('jwt')
@authorize({
  allowedRoles: [AuthorizationRoles.ADMIN],
})
export class ReceiptCustomerController {
  constructor(
    @repository(ReceiptRepository)
    public receiptRepository: ReceiptRepository,
  ) {}

  @get('/receipts/{id}/customer', {
    responses: {
      '200': {
        description: 'Customer belonging to Receipt',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Customer)},
          },
        },
      },
    },
  })
  async getCustomer(
    @param.path.number('id') id: typeof Receipt.prototype.id,
  ): Promise<Customer> {
    return this.receiptRepository.customer(id);
  }
}
