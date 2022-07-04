import dayjs from 'dayjs';
import {Item, OpeningHours, OrderedItem, ReceiptItem} from '../models';
import {Vat} from '../models/vat.model';
import {
  AllergyRepository,
  ItemVariantOptionRepository,
  OrderedItemRepository,
  OrderRepository,
  ProductGroupRepository,
} from '../repositories/';
import {itemVariantTotal} from './vatUtils';

type VariantType = {
  name: string;
  price: number | undefined;
};
export const getItemAndVariant = async (
  orderedItem: OrderedItem,
  itemVariantOptionRepository: ItemVariantOptionRepository,
  orderedItemRepository: OrderedItemRepository,
): Promise<[Item, VariantType[]]> => {
  const {id, variantOptionsIds = []} = orderedItem;
  const rawVariants = await Promise.all(
    variantOptionsIds.map(optionId =>
      itemVariantOptionRepository.findById(optionId),
    ),
  );
  const variants = rawVariants.map(({name, price}) => ({name, price}));
  const item = await orderedItemRepository.item(id);

  return [item, variants];
};

const getItemAllergies = async (
  orderedItem: OrderedItem,
  allergyRepository: AllergyRepository,
) => {
  const {allergyIds} = orderedItem;

  const selectedAllergies = allergyIds.map(async id => {
    const {name} = await allergyRepository.findById(id);
    return name;
  });

  return Promise.all(selectedAllergies);
};

export const getItemsWithVariants = async (
  orderedItems: OrderedItem[],
  itemVariantOptionRepository: ItemVariantOptionRepository,
  orderedItemRepository: OrderedItemRepository,
  allergyRepository: AllergyRepository,
) =>
  orderedItems.map(async orderedItem => {
    const allergies = await getItemAllergies(orderedItem, allergyRepository);
    const {quantity, productGroupId} = orderedItem;
    const [item, variants] = await getItemAndVariant(
      orderedItem,
      itemVariantOptionRepository,
      orderedItemRepository,
    );
    const {name, price} = item;
    return {
      quantity,
      name,
      price,
      variants,
      productGroupId,
      allergies,
    } as Partial<ReceiptItem & Item>;
  });

export const calcOrderTotal = (orderedItems: Partial<ReceiptItem & Item>[]) =>
  orderedItems.reduce((sum, item) => {
    if (!item.variants) {
      return sum + Number(item.price!) * item.quantity!;
    }
    const variantPrices = item.variants!.reduce(
      (variantSum, variant) => variantSum + Number(variant.price!),
      0,
    );
    const itemTotal = Number(item.price!) + variantPrices;

    return sum + itemTotal * item.quantity!;
  }, 0);

export const receiptItemsHandler = async (
  resolvedItems: Partial<ReceiptItem & Item>[],
  productGroupRepository: ProductGroupRepository,
) => {
  const itemsWithVat = await getItemsWithVat(
    resolvedItems,
    productGroupRepository,
  );
  const itemsWithVatStats = calculateItemVat(itemsWithVat);
  return itemsWithVatStats;
};

const getItemsWithVat = async (
  items: Partial<ReceiptItem & Item>[],
  productGroupRepository: ProductGroupRepository,
) => {
  const itemsWithVat = await Promise.all(
    items.map(async item => {
      const {
        name: productGroupName,
        vat,
      } = await productGroupRepository.findById(item.productGroupId);
      return {...item, productGroupName, vat};
    }),
  );

  return itemsWithVat;
};

const calculateItemVat = (
  items: Partial<
    ReceiptItem & Item & {vat: number; productGroupName: string}
  >[],
) => {
  return items.map(item => {
    const {quantity, price, variants, vat} = item;
    let variantTotal = 0;
    if (variants && variants.length !== 0) {
      variantTotal = itemVariantTotal(variants)!;
    }

    const gross = (+price! + variantTotal!) * quantity!;
    const receiptItemVat = {
      gross,
      vat,
    };
    return {...item, receiptItemVat} as ReceiptItem;
  });
};

export const calcReceiptVat = (items: ReceiptItem[]) =>
  Object.values(
    items.reduce((acc, item) => {
      const {receiptItemVat} = item;
      acc = {
        ...acc,
        [receiptItemVat.vat]: acc[receiptItemVat.vat]
          ? ({
              ...acc[receiptItemVat.vat],
              gross: acc[receiptItemVat.vat].gross + receiptItemVat.gross,
            } as Vat)
          : receiptItemVat,
      };
      return acc;
    }, {} as {[key: number]: Vat}),
  );

export const getOrderDayTimeSpan = () => {
  const now = dayjs().utc();
  const hour = now.format('HH');
  let startDate = now.set('hours', 5).set('minutes', 0).set('seconds', 0);
  let endDate = now
    .add(1, 'day')
    .set('hour', 5)
    .set('minutes', 0)
    .set('seconds', 0);
  if (+hour < 5) {
    startDate = startDate.subtract(1, 'day');
    endDate = endDate.subtract(1, 'day');
  }
  return {startDate: startDate.toISOString(), endDate: endDate.toISOString()};
};

export const checkOpeningHours = (
  openingHours: OpeningHours[],
  timezone: string,
) => {
  const currenctTime = dayjs.utc().tz(timezone).format('HH:mm');
  const dayIndex = dayjs().day();
  const todaysHours = openingHours[dayIndex];
  return (
    currenctTime > todaysHours?.openingHour &&
    currenctTime < todaysHours?.closingHour
  );
};

export const changeItemsProductGroup = async <T extends OrderRepository>(
  repository: T,
  orderedItems: OrderedItem[],
  orderId: number,
  productGroupId: number,
) => {
  for (const item of orderedItems) {
    await repository.orderedItems(orderId).create({...item, productGroupId});
  }
};
