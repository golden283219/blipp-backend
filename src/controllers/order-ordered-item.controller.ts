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
  HttpErrors,
  param,
  patch,
  post,
  requestBody,
} from '@loopback/rest';
import {getOrderCallbackName} from '../components/callbacks';
import {Order, OrderedItem} from '../models';
import pubsub from '../pubsub';
import {
  ItemRepository,
  ItemSubcategoryRepository,
  OrderedItemRepository,
  OrderRepository,
  ProductGroupRepository,
} from '../repositories';
import {DeliveryType, ItemCategory, OrderStatus} from '../types';
import {AuthorizationRoles} from '../types/jwt';
import {
  changeItemsProductGroup,
  getOrderDayTimeSpan,
} from '../utils/orderUtils';

interface SubcategoryStatusResult {
  orderId: number;
  subcategoryId: number;
  isDone: boolean;
}

@authenticate('jwt')
export class OrderOrderedItemController {
  constructor(
    @repository(OrderRepository) protected orderRepository: OrderRepository,
    @repository(OrderedItemRepository)
    protected orderedItemRepository: OrderedItemRepository,
    @repository(ItemRepository) protected itemRepository: ItemRepository,
    @repository(ItemSubcategoryRepository)
    protected itemSubcategoryRepository: ItemSubcategoryRepository,
    @repository(ProductGroupRepository)
    protected productGroupRepository: ProductGroupRepository,
  ) {}

  async notifyRestaurant(restaurantId: number) {
    const {startDate, endDate} = getOrderDayTimeSpan();

    const filter = {
      where: {
        restaurantId,
        and: [{createdAt: {gte: startDate}}, {createdAt: {lte: endDate}}],
        isPaid: true,
      },
      include: ['customer'],
    };
    const orders = await this.orderRepository.find(filter);
    const formattedOrders = orders.map(order => ({
      ...order,
      createdAt: new Date(order.createdAt).toISOString(),
    }));
    const topic = getOrderCallbackName(`${restaurantId}`);
    const payload = formattedOrders;
    await pubsub.publish(topic, payload);
  }

  async updateOrderStatus(
    id: number,
    orderedItems: Omit<OrderedItem, 'id'>[] | OrderedItem[],
  ) {
    const order = await this.orderRepository.findById(id);
    const {foodStatus, drinkStatus} = order;
    let orderedFood = false;
    let orderedDrink = false;

    for (const orderedItem of orderedItems) {
      const {itemSubcategoryId} = await this.itemRepository.findById(
        orderedItem.itemId,
      );
      const {category} = await this.itemSubcategoryRepository.findById(
        itemSubcategoryId,
      );
      if (category === ItemCategory.FOOD) {
        orderedFood = true;
      }
      if (category === ItemCategory.DRINK) {
        orderedDrink = true;
      }
      if (orderedFood && orderedDrink) {
        break;
      }
    }

    if (foodStatus === OrderStatus.NOT_ORDERED && orderedFood) {
      await this.orderRepository.updateById(id, {
        foodStatus: OrderStatus.ORDERED,
      });
      // await this.notifyRestaurant(order.restaurantId);
    }

    if (drinkStatus === OrderStatus.NOT_ORDERED && orderedDrink) {
      await this.orderRepository.updateById(id, {
        drinkStatus: OrderStatus.ORDERED,
      });
      // await this.notifyRestaurant(order.restaurantId);
    }
  }

  async updateOrderDoneStatus(id: number) {
    const order = await this.orderRepository.findById(id);
    const orderedItems = await this.orderRepository.orderedItems(id).find();
    const {foodStatus, drinkStatus} = order;
    let foodDone = true;
    let drinkDone = true;
    let hasFoodItems = false;
    let hasDrinkItems = false;

    for (const orderedItem of orderedItems) {
      const {isDone, itemId} = orderedItem;
      const item = await this.itemRepository.findById(itemId);
      const subCategory = await this.itemSubcategoryRepository.findById(
        item.itemSubcategoryId,
      );
      const {category} = subCategory ?? {};

      if (category === ItemCategory.FOOD) {
        foodDone = foodDone && isDone;
        hasFoodItems = true;
      }

      if (category === ItemCategory.DRINK) {
        drinkDone = drinkDone && isDone;
        hasDrinkItems = true;
      }
    }

    if (foodStatus !== OrderStatus.DONE && foodDone && hasFoodItems) {
      await this.orderRepository.updateById(id, {foodStatus: OrderStatus.DONE});
      await this.notifyRestaurant(order.restaurantId);
    } else if (foodStatus === OrderStatus.DONE && !foodDone) {
      await this.orderRepository.updateById(id, {
        foodStatus: OrderStatus.PREPARING,
      });
      await this.notifyRestaurant(order.restaurantId);
    }

    if (drinkStatus !== OrderStatus.DONE && drinkDone && hasDrinkItems) {
      await this.orderRepository.updateById(id, {
        drinkStatus: OrderStatus.DONE,
      });
      await this.notifyRestaurant(order.restaurantId);
    } else if (drinkStatus === OrderStatus.DONE && !drinkDone) {
      await this.orderRepository.updateById(id, {
        drinkStatus: OrderStatus.PREPARING,
      });
      await this.notifyRestaurant(order.restaurantId);
    }
  }

  @authorize({
    allowedRoles: [AuthorizationRoles.RESTAURANT, AuthorizationRoles.ADMIN],
  })
  @get('/orders/{id}/ordered-items', {
    responses: {
      '200': {
        description: 'Array of Order has many OrderedItem',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(OrderedItem, {includeRelations: true}),
            },
          },
        },
      },
    },
  })
  async find(
    @param.path.number('id') id: number,
    @param.query.object('filter') filter?: Filter<OrderedItem>,
  ): Promise<OrderedItem[]> {
    return this.orderRepository.orderedItems(id).find(filter);
  }

  @authorize({
    allowedRoles: [AuthorizationRoles.CUSTOMER, AuthorizationRoles.ADMIN],
  })
  @post('/orders/{id}/ordered-item', {
    responses: {
      '200': {
        description: 'Order model instance',
        content: {'application/json': {schema: getModelSchemaRef(OrderedItem)}},
      },
    },
  })
  async create(
    @param.path.number('id') id: typeof Order.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(OrderedItem, {
            title: 'NewOrderedItemInOrder',
            exclude: ['id'],
            optional: ['orderId'],
          }),
        },
      },
    })
    orderedItem: Omit<OrderedItem, 'id'>,
  ): Promise<OrderedItem> {
    await this.updateOrderStatus(id!, [orderedItem]);
    return this.orderRepository.orderedItems(id).create(orderedItem);
  }

  @authorize({
    allowedRoles: [AuthorizationRoles.CUSTOMER, AuthorizationRoles.ADMIN],
  })
  @post('/orders/{id}/ordered-items', {
    responses: {
      '200': {
        description: 'Order model instance',
        content: {'application/json': {schema: getModelSchemaRef(OrderedItem)}},
      },
    },
  })
  async createWithMultipleItems(
    @param.path.number('id') id: typeof Order.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: getModelSchemaRef(OrderedItem, {
              title: 'NewOrderedItemInOrder',
              exclude: ['id'],
              optional: ['orderId'],
            }),
          },
        },
      },
    })
    orderedItems: Omit<OrderedItem, 'id'>[],
  ): Promise<void> {
    const existingItems = await this.orderRepository.orderedItems(id).find();
    if (existingItems) {
      await this.orderRepository.orderedItems(id).delete();
    }
    const order = await this.orderRepository.findById(id);

    if (order?.deliveryType === DeliveryType.TAKEAWAY) {
      const takeawayProductGroup = await this.productGroupRepository.findOne({
        where: {restaurantId: order?.restaurantId, isTakeaway: true},
      });
      if (!takeawayProductGroup) {
        throw new HttpErrors.BadRequest(`Something went wrong!`);
      }
      await changeItemsProductGroup(
        this.orderRepository,
        orderedItems,
        id,
        takeawayProductGroup.id!,
      );

      await this.updateOrderStatus(id!, orderedItems);
      return;
    }

    if (order?.deliveryType === DeliveryType.DELIVERY) {
      const deliveryProductGroup = await this.productGroupRepository.findOne({
        where: {restaurantId: order?.restaurantId, isDelivery: true},
      });
      if (!deliveryProductGroup) {
        throw new HttpErrors.BadRequest(`Something went wrong!`);
      }
      await changeItemsProductGroup(
        this.orderRepository,
        orderedItems,
        id,
        deliveryProductGroup.id!,
      );

      await this.updateOrderStatus(id!, orderedItems);
      return;
    }

    for (const item of orderedItems) {
      await this.orderRepository.orderedItems(id).create(item);
    }

    await this.updateOrderStatus(id!, orderedItems);
  }

  @authorize({
    allowedRoles: [AuthorizationRoles.RESTAURANT, AuthorizationRoles.ADMIN],
  })
  @patch('/orders/{id}/ordered-items/{subcategoryId}/{isDone}/', {
    responses: {
      '200': {
        description: 'Order.OrderedItem PATCH success count',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                orderId: {
                  type: 'number',
                },
                subcategoryId: {
                  type: 'number',
                },
                isDone: {
                  type: 'boolean',
                },
              },
            },
          },
        },
      },
    },
  })
  async setSubcategoryDone(
    @param.path.number('id') id: number,
    @param.path.number('subcategoryId') subcategoryId: number,
    @param.path.boolean('isDone') isDone: boolean,
  ): Promise<SubcategoryStatusResult> {
    const orderedItems = await this.orderRepository.orderedItems(id).find();

    const update = {isDone};

    for (const orderedItem of orderedItems) {
      const {itemId, id: orderedItemId} = orderedItem;
      const item = await this.itemRepository.findById(itemId);
      const isRelevant = item.itemSubcategoryId === subcategoryId;
      if (orderedItemId && isRelevant) {
        await this.orderedItemRepository.updateById(orderedItemId, update);
      }
    }

    await this.updateOrderDoneStatus(id);
    return {orderId: id, subcategoryId, isDone};
  }

  @authorize({
    allowedRoles: [AuthorizationRoles.ADMIN],
  })
  @del('/orders/{id}/ordered-items', {
    responses: {
      '200': {
        description: 'Order.OrderedItem DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(OrderedItem))
    where?: Where<OrderedItem>,
  ): Promise<Count> {
    return this.orderRepository.orderedItems(id).delete(where);
  }
}
