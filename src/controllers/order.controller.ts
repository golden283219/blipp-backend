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
  HttpErrors,
  param,
  patch,
  post,
  put,
  requestBody,
} from '@loopback/rest';
import axios from 'axios';
import dayjs from 'dayjs';
import short from 'short-uuid';
import {getOrderCallbackName, orderCallbacks} from '../components/callbacks';
import {Order, Vat} from '../models';
import pubsub from '../pubsub';
import {
  AllergyRepository,
  ChatfuelCredentialsRepository,
  CurrencyRepository,
  CustomerRepository,
  DeliveryCostRepository,
  ItemVariantOptionRepository,
  MerchantCredentialsRepository,
  OrderedItemRepository,
  OrderRepository,
  ProductGroupRepository,
  RestaurantRepository,
  TermsUrlRepository,
} from '../repositories';
import {CashRegisterSystemRepository} from '../repositories/cash-register-system.repository';
import {PaymentInfoRepository} from '../repositories/payment-info.repository';
import {ReceiptRepository} from '../repositories/receipt.repository';
import {pdfEmailService} from '../services/email-service';
import {swedbankPayGet, swedbankPayPost} from '../services/payment-service';
import {DeliveryStatus, DeliveryType} from '../types/deliveryTypes';
import {EmailSubjectTypes} from '../types/emailTypes';
import {AuthorizationRoles} from '../types/jwt';
import {
  PaymentEndpoints,
  PaymentInfoTypes,
  PaymentOperations,
  PaymentStates,
  PaymentType,
  PaymentTypes,
} from '../types/paymentTypes';
import {broadcastApiEndpoint} from '../utils/chatfuel';
import {createEmailSubject} from '../utils/emailUtils';
import {
  calcOrderTotal,
  calcReceiptVat,
  checkOpeningHours,
  getItemsWithVariants,
  getOrderDayTimeSpan,
  receiptItemsHandler,
} from '../utils/orderUtils';
import {addPaymentInfo, generatePaymentPayload} from '../utils/paymentUtils';
import {receiptTemplate} from '../utils/receiptTemplate';
import {generateReceipt} from '../utils/receiptUtils';

export class OrderController {
  constructor(
    @repository(OrderRepository) public orderRepository: OrderRepository,
    @repository(RestaurantRepository)
    public restaurantRepository: RestaurantRepository,
    @repository(OrderedItemRepository)
    public orderedItemRepository: OrderedItemRepository,
    @repository(ReceiptRepository) public receiptRepository: ReceiptRepository,
    @repository(ProductGroupRepository)
    public productGroupRepository: ProductGroupRepository,
    @repository(CustomerRepository)
    public customerRepository: CustomerRepository,
    @repository(ItemVariantOptionRepository)
    public itemVariantOptionRepository: ItemVariantOptionRepository,
    @repository(CashRegisterSystemRepository)
    public cashRegisterSystemRepository: CashRegisterSystemRepository,
    @repository(AllergyRepository)
    public allergyRepository: AllergyRepository,
    @repository(PaymentInfoRepository)
    public paymentInfoRepository: PaymentInfoRepository,
    @repository(CurrencyRepository)
    public currencyRepository: CurrencyRepository,
    @repository(MerchantCredentialsRepository)
    public merchantCredentialsRepository: MerchantCredentialsRepository,
    @repository(TermsUrlRepository)
    public termsUrlRepository: TermsUrlRepository,
    @repository(ChatfuelCredentialsRepository)
    public chatfuelCredentialsRepository: ChatfuelCredentialsRepository,
    @repository(DeliveryCostRepository)
    public deliveryCostRepository: DeliveryCostRepository,
  ) {}

  async notifyRestaurant(restaurantId: number, orderId: number) {
    const order = await this.orderRepository.findById(orderId, {
      include: ['customer'],
    });
    if (order.isPaid) {
      const formattedOrder = {
        ...order,
        createdAt: dayjs(order.createdAt).toISOString(),
      };
      const topic = getOrderCallbackName(`${restaurantId}`);
      console.log('topic', topic);
      await pubsub.publish(topic, [formattedOrder]);
    }
  }

  @authenticate('jwt')
  @authorize({
    allowedRoles: [AuthorizationRoles.CUSTOMER, AuthorizationRoles.ADMIN],
  })
  @post('/orders', {
    responses: {
      '200': {
        description: 'Order model instance',
        content: {'application/json': {schema: getModelSchemaRef(Order)}},
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Order, {
            title: 'NewOrder',
            exclude: ['id'],
          }),
        },
      },
    })
    order: Omit<Order, 'id'>,
  ) {
    const deliveryType = DeliveryStatus[order.deliveryType];
    const restaurant = await this.restaurantRepository.findById(
      order.restaurantId,
    );
    const restaurantOpen = checkOpeningHours(
      restaurant.openingHours,
      restaurant.timezone,
    );
    if (!restaurantOpen) {
      throw new HttpErrors.BadRequest(`Restaurant is not open at this time.`);
    }
    if (!restaurant[deliveryType]) {
      throw new HttpErrors.BadRequest(
        `Restaurant does not allow ${order.deliveryType.toLocaleLowerCase()} at this time.`,
      );
    }
    return this.orderRepository.create(order);
  }

  // Query to create a MOCK order
  // @authenticate('jwt')
  // @authorize({
  //   allowedRoles: [AuthorizationRoles.ADMIN],
  // })
  // @post('/orders/mock/{restaurantId}', {
  //   responses: {
  //     '200': {
  //       description: 'Order model instance',
  //       content: {'application/json': {schema: getModelSchemaRef(Order)}},
  //     },
  //   },
  // })
  // async createMockOrder(
  //   @param.path.number('restaurantId') restaurantId: number,
  // ) {
  //   try {
  //     const newOrder = await this.orderRepository.create({
  //       restaurantId,
  //       customerId: 112,
  //       paymentMethod: 'Swish',
  //       isPaid: true,
  //       foodStatus: OrderStatus.ORDERED,
  //       extraInfo: {},
  //     });
  //     await this.orderRepository.orderedItems(newOrder.id).create({
  //       quantity: 1,
  //       itemId: 1,
  //       productGroupId: 1,
  //       allergyIds: [],
  //       specialRequest: '',
  //       variantOptionsIds: [],
  //     });
  //     await this.notifyRestaurant(restaurantId, newOrder.id);
  //     return newOrder;
  //   } catch (error) {
  //     return false;
  //   }
  // }

  @authenticate('jwt')
  @authorize({
    allowedRoles: [AuthorizationRoles.RESTAURANT, AuthorizationRoles.ADMIN],
  })
  @patch('/orders/{id}/notify', {
    responses: {
      '200': {
        description: 'Order model instance',
      },
    },
  })
  async notifyCustomer(@param.path.number('id') id: number) {
    const {customerId, restaurantId} = await this.orderRepository.findById(id);
    const {messengerId} = await this.customerRepository.findById(customerId);
    const chatfuelCred = await this.chatfuelCredentialsRepository.findOne({
      where: {restaurantId: restaurantId},
      include: [{relation: 'chatfuelBlocks', scope: {where: {name: 'DONE'}}}],
    });
    if (!messengerId || !chatfuelCred) return null;
    const url = broadcastApiEndpoint(messengerId, chatfuelCred);
    try {
      await axios.post(url, {});
    } catch (error) {
      console.log(error);
    }
  }

  @authenticate('jwt')
  @get('/orders/count', {
    responses: {
      '200': {
        description: 'Order model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(@param.where(Order) where?: Where<Order>): Promise<Count> {
    return this.orderRepository.count(where);
  }

  @authenticate('jwt')
  @authorize({
    allowedRoles: [AuthorizationRoles.RESTAURANT, AuthorizationRoles.ADMIN],
  })
  @get('/orders', {
    responses: {
      '200': {
        description: 'Array of Order model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Order, {includeRelations: true}),
            },
          },
        },
      },
    },
  })
  async find(@param.filter(Order) filter?: Filter<Order>): Promise<Order[]> {
    return this.orderRepository.find({
      ...filter,
      include: [
        'paymentInfo',
        'customer',
        'table',
        {
          relation: 'orderedItems',
          scope: {
            include: ['item'],
          },
        },
      ],
    });
  }

  @authenticate('jwt')
  @authorize({
    allowedRoles: [AuthorizationRoles.CUSTOMER, AuthorizationRoles.ADMIN],
  })
  @get('/orders/status', {
    responses: {
      '200': {
        description: 'Array of Order model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Order, {
                exclude: [
                  'cashRegisterSystemId',
                  'customerId',
                  'deliveryType',
                  'expectedAt',
                  'extraInfo',
                  'isActive',
                  'isPaid',
                  'open',
                  'orderedItems',
                  'paymentInfo',
                  'paymentMethod',
                  'receipt',
                  'restaurantId',
                  'tableId',
                ],
              }),
            },
          },
        },
      },
    },
  })
  async getOrderStatus(
    @param.filter(Order) filter?: Filter<Order>,
  ): Promise<Order[]> {
    const oneDayAgo = dayjs().subtract(1, 'day').toISOString();
    return this.orderRepository.find({
      ...filter,
      where: {
        ...filter?.where,
        createdAt: {gt: oneDayAgo},
      },
    });
  }

  @authenticate('jwt')
  @authorize({
    allowedRoles: [AuthorizationRoles.RESTAURANT, AuthorizationRoles.ADMIN],
  })
  @get('/lastDaysOrders', {
    responses: {
      '200': {
        description: 'Array of Order model instances from last day',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Order, {includeRelations: true}),
            },
          },
        },
        links: {
          fullCustomer: {
            operationId: 'getCustomer',
            parameters: {
              id: '$response.body#/customerId',
            },
          },
          fullTable: {
            operationId: 'getTable',
            parameters: {
              id: '$response.body#/tableId',
            },
          },
        },
      },
    },
  })
  async findLasyDaysorders(
    @param.filter(Order) filter?: Filter<Order>,
  ): Promise<Order[]> {
    const {startDate, endDate} = getOrderDayTimeSpan();

    const fullFilter = {
      ...filter,
      where: {
        ...filter?.where,
        and: [{createdAt: {gte: startDate}}, {createdAt: {lte: endDate}}],
        isPaid: true,
      },
      include: ['customer'],
    };
    return this.orderRepository.find(fullFilter);
  }

  @authenticate('jwt')
  @authorize({
    allowedRoles: [AuthorizationRoles.RESTAURANT, AuthorizationRoles.ADMIN],
  })
  @get('/orders/{id}', {
    responses: {
      '200': {
        description: 'Order model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Order, {includeRelations: true}),
          },
        },
        links: {
          fullCustomer: {
            operationId: 'getCustomer',
            parameters: {
              id: '$response.body#/customerId',
            },
          },
          fullTable: {
            operationId: 'getTable',
            parameters: {
              id: '$response.body#/tableId',
            },
          },
        },
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Order, {exclude: 'where'})
    filter?: FilterExcludingWhere<Order>,
  ): Promise<Order> {
    return this.orderRepository.findById(
      id,
      {include: ['orderedItems']},
      filter,
    );
  }

  @authenticate('jwt')
  @authorize({
    allowedRoles: [AuthorizationRoles.RESTAURANT, AuthorizationRoles.ADMIN],
  })
  @patch('/orders/{id}', {
    responses: {
      '200': {
        description: 'Order model instance',
        content: {'application/json': {schema: getModelSchemaRef(Order)}},
      },
    },
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Order, {partial: true}),
        },
      },
    })
    order: Order,
  ): Promise<Order> {
    await this.orderRepository.updateById(id, order);
    const updatedOrder = await this.orderRepository.findById(id);
    await this.notifyRestaurant(updatedOrder.restaurantId, id);
    return updatedOrder;
  }

  @post('/orders/paymentCallback', {
    responses: {
      '200': {
        description: 'Order model instance',
      },
    },
  })
  async paymentCallback(
    @requestBody()
    payload: any,
  ) {
    // TODO - callback logic for swedbankpay
    console.log(payload);
    return true;
  }

  @authenticate('jwt')
  @authorize({
    allowedRoles: [AuthorizationRoles.CUSTOMER, AuthorizationRoles.ADMIN],
  })
  @patch('/orders/{id}/getPaymentStatus', {
    responses: {
      '200': {
        description: 'Payment confirmation',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                paymentConfirmation: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
    callbacks: {
      orderCallbacks,
    },
  })
  async getPaymentStatus(
    @requestBody({
      description: 'Input for getPaymentStatus',
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['paymentType'],
            properties: {
              paymentType: {
                type: 'string',
              },
            },
          },
        },
      },
    })
    paymentInfo: {
      paymentType: PaymentType;
    },
    @param.path.number('id') orderId: number,
  ) {
    const {paymentType} = paymentInfo;
    const {paymentId} = (await this.paymentInfoRepository.findOne({
      where: {orderId},
    })) as {paymentId: string};

    const order = await this.orderRepository.findById(orderId);

    if (order.isPaid) {
      throw new HttpErrors.BadRequest('Something went wrong');
    }
    const merchantCredentials = await this.merchantCredentialsRepository.findOne(
      {where: {restaurantId: order?.restaurantId}},
    );

    if (!merchantCredentials) {
      throw new HttpErrors.BadRequest('Something went wrong');
    }

    const isSwish = paymentType === PaymentTypes.SWISH;

    const ENDPOINT = isSwish ? `${paymentId}/sales` : `${paymentId}/captures`;
    try {
      const data = await swedbankPayGet(ENDPOINT, merchantCredentials.token);

      const state = isSwish
        ? data.sales.saleList[0].transaction.state
        : data.captures.captureList[0].transaction.state;

      if (state === PaymentStates.COMPLETED) {
        const cardInfoRes = !isSwish
          ? await swedbankPayGet(
              `${paymentId}/authorizations`,
              merchantCredentials.token,
            )
          : null;

        const cardInfo = cardInfoRes?.authorizations?.authorizationList[0];
        await this.orderRepository.updateById(orderId, {
          isPaid: true,
        });

        const {messengerId, email} = await this.customerRepository.findById(
          order.customerId,
        );
        const {timezone} = await this.restaurantRepository.findById(
          order.restaurantId,
        );

        const receipt = await generateReceipt(
          order,
          this.restaurantRepository,
          this.orderRepository,
          this.orderedItemRepository,
          this.itemVariantOptionRepository,
          this.productGroupRepository,
          this.cashRegisterSystemRepository,
          this.receiptRepository,
          this.allergyRepository,
          this.currencyRepository,
          this.deliveryCostRepository,
          cardInfo,
        );
        await this.receiptRepository.create(receipt);
        const subject = createEmailSubject(
          EmailSubjectTypes.RECEIPT,
          receipt.date,
          timezone,
        );

        if (!messengerId) {
          const template = receiptTemplate(receipt, timezone, true);
          await pdfEmailService(template, orderId, email, subject);
        }

        await this.notifyRestaurant(order.restaurantId, orderId);

        return {paymentConfirmation: PaymentStates.COMPLETED};
      } else {
        return {paymentConfirmation: PaymentStates.FAILED};
      }
    } catch (error) {
      return {paymentConfirmation: PaymentStates.FAILED};
    }
  }

  @authenticate('jwt')
  @authorize({
    allowedRoles: [AuthorizationRoles.CUSTOMER, AuthorizationRoles.ADMIN],
  })
  @patch('/orders/getPayment', {
    responses: {
      '200': {
        description: 'PaymentOperations',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: {
                'x-ts-type': 'PaymentOperations',
              },
            },
          },
        },
      },
    },
  })
  async getPayment(
    @requestBody({
      description: 'Input for paymentOperations',
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['orderId', 'paymentType'],
            properties: {
              orderId: {
                type: 'number',
              },
              paymentType: {
                type: 'string',
              },
              phoneNumber: {
                type: 'string',
              },
            },
          },
        },
      },
    })
    paymentInfo: PaymentInfoTypes,
  ): Promise<PaymentOperations[] | null> {
    const {orderId, paymentType, phoneNumber} = paymentInfo;
    if (
      paymentType !== PaymentTypes.SWISH &&
      paymentType !== PaymentTypes.CREDITCARD
    ) {
      return null;
    }

    const order = await this.orderRepository.findById(orderId);
    if (!order) return null;

    const restaurant = await this.restaurantRepository.findById(
      order.restaurantId,
    );
    const customer = await this.customerRepository.findById(order.customerId);

    const orderedItems = await this.orderRepository
      .orderedItems(orderId)
      .find();

    const itemsWithVariants = await getItemsWithVariants(
      orderedItems,
      this.itemVariantOptionRepository,
      this.orderedItemRepository,
      this.allergyRepository,
    );
    const resolvedItems = await Promise.all(itemsWithVariants);

    let total = calcOrderTotal(resolvedItems);
    const items = await receiptItemsHandler(
      resolvedItems,
      this.productGroupRepository,
    );

    let vats = calcReceiptVat(items);
    if (order.deliveryType === DeliveryType.DELIVERY) {
      const deliveryCost = await this.deliveryCostRepository.findOne({
        where: {restaurantId: order.restaurantId},
      });
      if (!deliveryCost) {
        throw new HttpErrors.BadRequest(`Something went wrong!`);
      }
      const {cost, productGroupId} = deliveryCost;
      const deliveryProductGroup = await this.productGroupRepository.findById(
        productGroupId,
      );
      total += cost;
      const deliveryVat = new Vat({
        gross: cost,
        vat: deliveryProductGroup?.vat,
      });
      vats = [...vats, deliveryVat];
    }

    const merchantCredentials = await this.merchantCredentialsRepository.findOne(
      {where: {restaurantId: order.restaurantId}},
    );
    const termsUrl = await this.termsUrlRepository.findOne({
      where: {restaurantId: order.restaurantId},
    });
    if (!merchantCredentials || !termsUrl) {
      throw new Error('No credentials');
    }

    const payeeReference = `${order.id}-${short.generate()}`;
    const {jsonPayload, prices} = generatePaymentPayload(
      orderId,
      paymentType,
      total,
      payeeReference,
      vats,
      merchantCredentials,
      termsUrl,
      customer?.messengerId,
      phoneNumber,
    );

    const ENDPOINT =
      paymentInfo.paymentType === PaymentTypes.SWISH
        ? PaymentEndpoints.SWISH_ENDPOINT
        : PaymentEndpoints.CARD_ENDPOINT;
    try {
      const data = await swedbankPayPost(
        jsonPayload,
        ENDPOINT,
        merchantCredentials?.token,
      );
      await addPaymentInfo(
        order,
        payeeReference,
        data,
        prices,
        this.paymentInfoRepository,
        merchantCredentials?.merchantName,
      );

      return data.operations as PaymentOperations[];
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  @authenticate('jwt')
  @authorize({
    allowedRoles: [AuthorizationRoles.ADMIN],
  })
  @put('/orders/{id}', {
    responses: {
      '204': {
        description: 'Order PUT success',
      },
    },
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() order: Order,
  ): Promise<void> {
    await this.orderRepository.replaceById(id, order);
    const replacedOrder = await this.orderRepository.findById(id);
    await this.notifyRestaurant(replacedOrder.restaurantId, id);
  }

  @authenticate('jwt')
  @authorize({
    allowedRoles: [AuthorizationRoles.ADMIN],
  })
  @del('/orders/{id}', {
    responses: {
      '204': {
        description: 'Order DELETE success',
      },
    },
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    const deletingOrder = await this.orderRepository.findById(id);
    await this.orderRepository.deleteById(id);
    await this.notifyRestaurant(deletingOrder.restaurantId, id);
  }
}
