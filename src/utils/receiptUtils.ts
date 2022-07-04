import {HttpErrors} from '@loopback/rest';
import {Order, Receipt, ReceiptRelations, Vat} from '../models';
import {
  AllergyRepository,
  CurrencyRepository,
  DeliveryCostRepository,
  ItemVariantOptionRepository,
  OrderedItemRepository,
  OrderRepository,
  ProductGroupRepository,
  ReceiptRepository,
  RestaurantRepository,
} from '../repositories';
import {CashRegisterSystemRepository} from '../repositories/cash-register-system.repository';
import {DeliveryType} from '../types';
import {calcRoundingTotal} from './calcUtils';
import {
  calcOrderTotal,
  calcReceiptVat,
  getItemsWithVariants,
  receiptItemsHandler,
} from './orderUtils';

export const generateReceipt = async (
  order: Order,
  restaurantRepository: RestaurantRepository,
  orderRepository: OrderRepository,
  orderedItemRepository: OrderedItemRepository,
  itemVariantOptionRepository: ItemVariantOptionRepository,
  productGroupRepository: ProductGroupRepository,
  cashRegisterSystemRepository: CashRegisterSystemRepository,
  receiptRepository: ReceiptRepository,
  allergyRepository: AllergyRepository,
  currencyRepository: CurrencyRepository,
  deliveryCostRepository: DeliveryCostRepository,
  cardInfo?: any,
) => {
  const {
    restaurantId,
    customerId,
    createdAt: date,
    id: orderId,
    deliveryType,
    paymentMethod,
    tableId,
  } = order; // TODO: Replace with paidAt?
  // TODO - get cashRegisterId from order
  const cashRegisterId = 1;

  const lastReceipt = await receiptRepository.findOne({
    where: {restaurantId, cashRegisterSystemId: cashRegisterId},
    order: ['date DESC'],
  });

  const restaurant = await restaurantRepository.findById(restaurantId, {
    include: ['cashRegisterSystems'],
  });
  const currency = await currencyRepository.findById(restaurant.currencyId);
  const customer = await orderRepository.customer(orderId);
  const orderedItems = await orderRepository.orderedItems(orderId).find();

  const tableName = await handleTableName(orderRepository, orderId, tableId);

  const itemsWithVariants = await getItemsWithVariants(
    orderedItems,
    itemVariantOptionRepository,
    orderedItemRepository,
    allergyRepository,
  );

  const resolvedItems = await Promise.all(itemsWithVariants);

  let total = calcOrderTotal(resolvedItems);

  const rounding = calcRoundingTotal(total);

  const items = await receiptItemsHandler(
    resolvedItems,
    productGroupRepository,
  );

  let receiptVat = calcReceiptVat(items);

  const customerName = `${customer.firstName} ${customer.lastName}`;
  const {
    id,
    address,
    orgnr,
    name: restaurantName,
    phoneNumber: restaurantPhoneNumber,
  } = restaurant;

  const deliveryCost = await deliveryCostRepository.findOne({
    where: {restaurantId: id},
  });

  const deliveryProductGroup = await productGroupRepository.findById(
    deliveryCost?.productGroupId,
  );

  if (order.deliveryType === DeliveryType.DELIVERY) {
    if (!deliveryCost) {
      throw new HttpErrors.BadRequest(`Something went wrong!`);
    }
    total += deliveryCost.cost;
    const deliveryVat = new Vat({
      gross: deliveryCost.cost,
      vat: deliveryProductGroup?.vat,
    });
    receiptVat = [...receiptVat, deliveryVat];
  }

  const sn = handleSnNumber(cashRegisterId, lastReceipt);
  const ka = `${orgnr}${cashRegisterId}`;

  const cardType = cardInfo && `${cardInfo.cardBrand} ${cardInfo.cardType}`;
  const cardNumber = cardInfo && createMaskedCardNumber(cardInfo.maskedPan);
  const deliveryCostInfo =
    order.deliveryType === DeliveryType.DELIVERY
      ? JSON.stringify(
          new Vat({
            gross: deliveryCost?.cost,
            vat: deliveryProductGroup?.vat,
          }),
        )
      : undefined;

  return new Receipt({
    restaurantId,
    customerId,
    items,
    date,
    address,
    receiptCurrency: currency,
    paymentMethod,
    orgnr,
    total,
    restaurantName,
    restaurantPhoneNumber,
    deliveryType,
    customerName,
    sn,
    ka,
    receiptVat,
    rounding,
    tableName,
    cashRegisterSystemId: cashRegisterId,
    orderId,
    cardType,
    cardNumber,
    deliveryCostInfo,
  });
};

const handleSnNumber = (
  cashRegisterId: number,
  lastReceipt: (Receipt & ReceiptRelations) | null,
) => {
  if (!lastReceipt) return `${cashRegisterId}000000001`;
  const {sn} = lastReceipt;
  const newId = +sn + 1;
  return newId.toString();
};

const handleTableName = async (
  orderRepository: OrderRepository,
  orderId: number,
  tableId?: number,
) => {
  if (!tableId) return undefined;
  const {name} = await orderRepository.table(orderId);
  return name;
};

const createMaskedCardNumber = (num: string) => {
  const lastFour = num.slice(-4);
  return `************${lastFour}`;
};
