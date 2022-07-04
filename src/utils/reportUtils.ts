import {
  DeliveryCost,
  ProductGroup,
  ProductGroupRelations,
  Receipt,
  ReceiptItem,
  ReportGrandTotal,
  ReportOpenOrder,
  ReportPaymentMethods,
  ReportProductGroup,
  ReportReturnedReceipts,
  Vat,
} from '../models';
import {Report} from '../models/report.model';
import {PaymentMethod, ReportInput} from '../types';
import {getItemAndVariant} from './orderUtils';
import {getReportTimeSpan} from './timeUtils';

export const zReportCronTime = '0 0 5 * * *';

export const generateReport = async ({
  reportType,
  restaurantId,
  restaurantRepository,
  orderRepository,
  orderedItemRepository,
  receiptRepository,
  productGroupRepository,
  itemVariantOptionRepository,
  tableRepository,
}: ReportInput) => {
  const {startDate, endDate} = getReportTimeSpan(reportType!);

  const {
    name,
    address,
    orgnr,
    deliveryCost,
  } = await restaurantRepository!.findById(restaurantId!, {
    include: ['deliveryCost'],
  });
  const receipts = await receiptRepository!.find({
    where: {
      and: [
        {restaurantId},
        {date: {between: [startDate, endDate]}},
        {isReturnReceipt: false},
      ],
    },
  });
  const returnedReceipts = await receiptRepository!.find({
    where: {
      and: [
        {restaurantId},
        {date: {between: [startDate, endDate]}},
        {isReturnReceipt: true},
      ],
    },
  });

  const reportPaymentMethods = getPaymentMethodStats({receipts});

  const reportProductGroup = await getProductGroupStats({
    receipts,
    restaurantId,
    productGroupRepository,
    deliveryCost,
  });

  const reportVat = getVatStats({receipts});

  const reportOpenOrder = await getOpenOrders({
    orderRepository,
    orderedItemRepository,
    itemVariantOptionRepository,
    tableRepository,
    restaurantId,
  });

  const {reportReturnedReceipts, itemsReturned} = getReturnReceiptStats({
    receipts: returnedReceipts,
  });

  const reportGrandTotal = await getGrandTotal({
    receiptRepository,
    restaurantId,
  });

  const timestamp = new Date().toISOString();
  const report = new Report({
    reportType,
    startDate,
    endDate,
    timestamp,
    checkout: 'Alla',
    cashier: 'Kassör 1',
    name,
    address,
    orgnr,
    restaurantId,
    receiptsReturned: returnedReceipts.length,
    itemsReturned,
    reportPaymentMethods,
    reportProductGroup,
    reportVat,
    reportOpenOrder,
    reportReturnedReceipts,
    reportGrandTotal,
    totalOrders: receipts.length,
  });

  return report;
};

///////////////////ProductGroup stats
type ProductGroupsWithItems = Partial<
  ProductGroup & {itemsInCategory: ReceiptItem[]; deliveries: number[]}
>;
const getProductGroupStats = async ({
  receipts,
  restaurantId,
  productGroupRepository,
  deliveryCost,
}: ReportInput) => {
  const productGroups = await productGroupRepository!.find({
    where: {restaurantId},
  });
  const productGroupsWithItems = addItemsToProductGroups(
    receipts!,
    productGroups,
    deliveryCost!,
  );
  return calcProductGroupStats(productGroupsWithItems);
};

const addItemsToProductGroups = (
  receipts: Receipt[],
  productGroups: (ProductGroup & ProductGroupRelations)[],
  deliveryCost: DeliveryCost,
) => {
  const allTodaysItems = receipts.reduce(
    (items, receipt) => [...items, ...receipt.items],
    [] as ReceiptItem[],
  );

  const todaysDeliveries = receipts.reduce((deliveries, receipt) => {
    if (receipt.deliveryCostInfo) {
      const deliveryCostInfo = JSON.parse(receipt.deliveryCostInfo);
      return [...deliveries, deliveryCostInfo.gross];
    }
    return deliveries;
  }, [] as number[]);
  return productGroups.map(productGroup => {
    const itemsInCategory = allTodaysItems.filter(item => {
      if (item.productGroupId === productGroup.id) {
        return item;
      }
    });

    return {
      ...productGroup,
      itemsInCategory,
      deliveries:
        productGroup.id === deliveryCost.productGroupId
          ? todaysDeliveries
          : null,
    } as ProductGroupsWithItems;
  });
};

const calcProductGroupStats = (
  productGroupsWithItems: ProductGroupsWithItems[],
) => {
  return productGroupsWithItems.map(productGroup => {
    let total = 0;
    let amount = 0;
    if (productGroup.itemsInCategory!.length !== 0) {
      const items = productGroup.itemsInCategory!;
      for (const item of items) {
        total += item.receiptItemVat.gross;
        amount += item.quantity;
      }
    }

    if (productGroup.deliveries) {
      total = productGroup.deliveries.reduce((acc, num) => acc + num, 0);
      amount = productGroup.deliveries.length;
    }

    const {
      id,
      itemsInCategory,
      restaurantId,
      deliveries,
      isTakeaway,
      isDelivery,
      ...filteredProductGroup
    } = productGroup;

    return new ReportProductGroup({
      ...filteredProductGroup,
      total,
      items: amount,
    });
  });
};
///////////////////

///////////////////PaymentMethod

const getPaymentMethodStats = ({receipts}: ReportInput) => {
  const categorisedTotal = categoriseReceiptTotals({receipts});
  return structurePaymentStats(categorisedTotal);
};

type Categorised = {[key in PaymentMethod]: number[]};
const categoriseReceiptTotals = ({receipts}: ReportInput) => {
  let categorisedTotal = <Categorised>{};
  for (const receipt of receipts!) {
    categorisedTotal = {
      ...categorisedTotal,
      [receipt.paymentMethod]: categorisedTotal[receipt.paymentMethod]
        ? [...categorisedTotal[receipt.paymentMethod], receipt.total]
        : [receipt.total],
    };
  }
  return categorisedTotal;
};

const structurePaymentStats = (categorisedTotal: Categorised) =>
  Object.keys(categorisedTotal).map(category => {
    return new ReportPaymentMethods({
      paymentMethod: category,
      orders: categorisedTotal[category as PaymentMethod].length,
      total: categorisedTotal[category as PaymentMethod].reduce(
        (sum, price) => sum + +price,
        0,
      ),
    });
  });

////////////////////

/////////////////// VAT
const getVatStats = ({receipts}: ReportInput) => {
  let todaysVatTotal: {[key: string]: Vat} = {};

  const receiptVat = receipts!.reduce((vats, receipt) => {
    const itemVats = receipt.items.map(item => item.receiptItemVat);
    const deliveryCost = receipt.deliveryCostInfo
      ? [JSON.parse(receipt.deliveryCostInfo)]
      : [];

    return [...vats, ...itemVats, ...deliveryCost];
  }, [] as Vat[]);

  for (const vatObj of receiptVat) {
    const {vat, gross} = vatObj!;
    todaysVatTotal = {
      ...todaysVatTotal,
      [vat]: todaysVatTotal[vat]
        ? {
            vat,
            gross: +(todaysVatTotal[vat].gross + gross).toFixed(2),
          }
        : {vat, gross},
    };
  }
  return Object.values(todaysVatTotal);
};
///////////////////

////////////////// Open orders / tables
const getOpenOrders = async ({
  orderRepository,
  orderedItemRepository,
  itemVariantOptionRepository,
  tableRepository,
  restaurantId,
}: ReportInput) => {
  const openOrders = await orderRepository!.find({
    where: {restaurantId, open: true},
    include: ['table', 'orderedItems'],
  });

  return Promise.all(
    openOrders.map(async order => {
      return calcTableStats({
        order,
        orderedItemRepository,
        itemVariantOptionRepository,
        tableRepository,
      });
    }),
  );
};

const calcTableStats = async ({
  order,
  orderedItemRepository,
  itemVariantOptionRepository,
  tableRepository,
}: ReportInput) => {
  let total = 0;
  const {name: tableName} = await tableRepository!.findById(order?.tableId);

  for (const orderedItem of order!.orderedItems) {
    const [item, variants] = await getItemAndVariant(
      orderedItem,
      itemVariantOptionRepository!,
      orderedItemRepository!,
    );
    const {price} = item;
    const itemTotal =
      (variants.reduce((sum, variant) => sum + variant.price!, 0) + price!) *
      orderedItem.quantity;
    total += itemTotal;
  }

  return new ReportOpenOrder({tableName, total});
};

//////////////////////

///////////////////// Return receipt
const getReturnReceiptStats = ({receipts}: ReportInput) => {
  const paymentMethodStats = getPaymentMethodStats({
    receipts,
  });

  const itemsReturned = receipts!.reduce(
    (sum, receipt) => sum + receipt.items.length,
    0,
  );

  const reportReturnedReceipts = paymentMethodStats.map(
    receiptStat =>
      new ReportReturnedReceipts({
        paymentMethod: receiptStat.paymentMethod,
        total: receiptStat.total,
      }),
  );
  return {reportReturnedReceipts, itemsReturned};
};
/////////////////////

///////////////////// GRAND total
const getGrandTotal = async ({
  receiptRepository,
  restaurantId,
}: ReportInput) => {
  const allReceipts = await receiptRepository!.find({
    where: {
      and: [{restaurantId}, {isReturnReceipt: false}],
    },
  });
  const allReturnedReceipts = await receiptRepository!.find({
    where: {
      and: [{restaurantId}, {isReturnReceipt: true}],
    },
  });
  const gross = allReceipts.reduce((sum, receipt) => sum + +receipt.total, 0);

  const grossReturned = allReturnedReceipts.reduce(
    (sum, receipt) => sum + +receipt.total,
    0,
  );

  return new ReportGrandTotal({gross, grossReturned});
};
/////////////////////
