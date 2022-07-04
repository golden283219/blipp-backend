import {authenticate} from '@loopback/authentication';
import {authorize} from '@loopback/authorization';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  param,
  patch,
  post,
  put,
  requestBody
} from '@loopback/rest';
import {Receipt} from '../models';
import {
  MerchantCredentialsRepository,
  OrderRepository,
  ReceiptRepository,
  RestaurantRepository
} from '../repositories';
import {pdfEmailService} from '../services/email-service';
import {swedbankPayPost} from '../services/payment-service';
import {EmailSubjectTypes} from '../types/emailTypes';
import {AuthorizationRoles} from '../types/jwt';
import {createEmailSubject} from '../utils/emailUtils';
import {getReversalJSON} from '../utils/paymentUtils';
import {receiptTemplate} from '../utils/receiptTemplate';

@authenticate('jwt')
export class ReceiptController {
  constructor(
    @repository(ReceiptRepository)
    public receiptRepository: ReceiptRepository,
    @repository(OrderRepository)
    public orderRepository: OrderRepository,
    @repository(RestaurantRepository)
    public restaurantRepository: RestaurantRepository,
    @repository(MerchantCredentialsRepository)
    public merchantCredentialsRepository: MerchantCredentialsRepository,
  ) {}

  @authorize({
    allowedRoles: [AuthorizationRoles.CUSTOMER, AuthorizationRoles.ADMIN],
  })
  @post('/receipts', {
    responses: {
      '200': {
        description: 'Receipt model instance',
        content: {'application/json': {schema: getModelSchemaRef(Receipt)}},
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Receipt, {
            title: 'NewReceipt',
            exclude: ['id'],
          }),
        },
      },
    })
    receipt: Omit<Receipt, 'id'>,
  ): Promise<Receipt> {
    return this.receiptRepository.create(receipt);
  }

  @authorize({
    allowedRoles: [AuthorizationRoles.ADMIN],
  })
  @get('/receipts/count', {
    responses: {
      '200': {
        description: 'Receipt model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(@param.where(Receipt) where?: Where<Receipt>): Promise<Count> {
    return this.receiptRepository.count(where);
  }

  @authorize({
    allowedRoles: [
      AuthorizationRoles.CUSTOMER,
      AuthorizationRoles.RESTAURANT,
      AuthorizationRoles.ADMIN,
    ],
  })
  @get('/receipts', {
    responses: {
      '200': {
        description: 'Array of Receipt model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Receipt, {includeRelations: true}),
            },
          },
        },
      },
    },
  })
  async find(
    @param.filter(Receipt) filter?: Filter<Receipt>,
  ): Promise<Receipt[]> {
    return this.receiptRepository.find(filter);
  }

  @authorize({
    allowedRoles: [AuthorizationRoles.RESTAURANT, AuthorizationRoles.ADMIN],
  })
  @patch('/receipts', {
    responses: {
      '200': {
        description: 'Receipt PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Receipt, {partial: true}),
        },
      },
    })
    receipt: Receipt,
    @param.where(Receipt) where?: Where<Receipt>,
  ): Promise<Count> {
    return this.receiptRepository.updateAll(receipt, where);
  }

  @authorize({
    allowedRoles: [AuthorizationRoles.RESTAURANT, AuthorizationRoles.ADMIN],
  })
  @patch('/receipts/{id}/email', {
    responses: {
      '204': {
        description: 'Send receipt-pdf',
      },
    },
  })
  async emailReceipt(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              email: {
                type: 'string',
              },
            },
          },
        },
      },
    })
    input: {email: string},
    @param.path.number('id')
    id: number,
  ) {
    const receipt = await this.receiptRepository.findById(id);
    if (!receipt.allowedToCopy) {
      throw new Error("Can't make any more copies of this receipt");
    }
    await this.receiptRepository.updateById(id, {allowedToCopy: false});
    const { timezone } = await this.restaurantRepository.findById(receipt.restaurantId)
    const template = receiptTemplate(receipt, timezone);
    const subject = createEmailSubject(EmailSubjectTypes.RECEIPT, receipt.date, timezone);
    return pdfEmailService(template, id, input.email, subject);
  }

  @authorize({
    allowedRoles: [AuthorizationRoles.RESTAURANT, AuthorizationRoles.ADMIN],
  })
  @get('/receipts/{id}', {
    responses: {
      '200': {
        description: 'Receipt model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Receipt, {includeRelations: true}),
          },
        },
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Receipt, {exclude: 'where'})
    filter?: FilterExcludingWhere<Receipt>,
  ): Promise<Receipt> {
    return this.receiptRepository.findById(id, {
      ...filter,
      include: ['receiptVat'],
    });
  }

  @authorize({
    allowedRoles: [AuthorizationRoles.RESTAURANT, AuthorizationRoles.ADMIN],
  })
  @patch('/receipts/{id}', {
    responses: {
      '204': {
        description: 'Receipt PATCH success',
      },
    },
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Receipt, {partial: true}),
        },
      },
    })
    receipt: Receipt,
  ): Promise<void> {
    await this.receiptRepository.updateById(id, receipt);
  }

  @authorize({
    allowedRoles: [AuthorizationRoles.RESTAURANT, AuthorizationRoles.ADMIN],
  })
  @patch('/receipts/{id}/return', {
    responses: {
      '204': {
        description: 'Return receipt',
      },
    },
  })
  async returnReceipt(@param.path.number('id') id: number) {
    const receipt = await this.receiptRepository.findById(id);
    if (receipt.isReturned || receipt.isReturnReceipt) return null;
    const order = await this.orderRepository.findById(receipt.orderId, {
      include: ['paymentInfo'],
    });
    const merchantCredentials = await this.merchantCredentialsRepository.findOne(
      {where: {restaurantId: order.restaurantId}},
    );
    if (!merchantCredentials) {
      throw new Error('No credentials');
    }

    const JSONPayload = getReversalJSON(order.paymentInfo, order.id);
    const REVERSAL_ENDPOINT = `${order.paymentInfo.paymentId}/reversals`;
    try {
      const data = await swedbankPayPost(
        JSONPayload,
        REVERSAL_ENDPOINT,
        merchantCredentials.token,
      );
      await this.receiptRepository.updateById(id, {
        ...receipt,
        isReturned: true,
      });

      const { id: receiptId, allowedToCopy, ...receiptCopy } = receipt
      await this.receiptRepository.create({
        ...receiptCopy,
        isReturnReceipt: true,
      });

      return {state: data.reversal.transaction.state};
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  @authorize({
    allowedRoles: [AuthorizationRoles.ADMIN],
  })
  @put('/receipts/{id}', {
    responses: {
      '204': {
        description: 'Receipt PUT success',
      },
    },
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() receipt: Receipt,
  ): Promise<void> {
    await this.receiptRepository.replaceById(id, receipt);
  }

  @authorize({
    allowedRoles: [AuthorizationRoles.ADMIN],
  })
  @del('/receipts/{id}', {
    responses: {
      '204': {
        description: 'Receipt DELETE success',
      },
    },
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.receiptRepository.deleteById(id);
  }
}
