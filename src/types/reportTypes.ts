import {DeliveryCost, Order, OrderRelations, Receipt} from '../models';
import {
  ItemSubcategoryRepository,
  ItemVariantOptionRepository,
  OrderedItemRepository,
  OrderRepository,
  ProductGroupRepository,
  ReceiptRepository,
  RestaurantRepository,
  TableRepository,
} from '../repositories';

export type ReportInput = {
  reportType?: ReportType;
  restaurantId?: number;
  receipts?: Receipt[];
  order?: Order & OrderRelations;
  restaurantRepository?: RestaurantRepository;
  orderRepository?: OrderRepository;
  orderedItemRepository?: OrderedItemRepository;
  receiptRepository?: ReceiptRepository;
  itemSubcategoryRepository?: ItemSubcategoryRepository;
  productGroupRepository?: ProductGroupRepository;
  itemVariantOptionRepository?: ItemVariantOptionRepository;
  tableRepository?: TableRepository;
  deliveryCost?: DeliveryCost;
};

export type ReportType = 'X' | 'Z';

export enum ReportTypes {
  X = 'X',
  Z = 'Z',
}
