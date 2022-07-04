import {Getter, inject} from '@loopback/core';
import {DefaultCrudRepository, HasManyRepositoryFactory, repository, BelongsToAccessor, HasOneRepositoryFactory} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {ItemSubcategory, Order, Restaurant, RestaurantRelations, Table, Receipt, Report, ProductGroup, CashRegisterSystem, Currency, TermsUrl, ChatfuelCredentials, DeliveryCost} from '../models';
import {ItemSubcategoryRepository} from './item-subcategory.repository';
import {OrderRepository} from './order.repository';
import {TableRepository} from './table.repository';
import {ReceiptRepository} from './receipt.repository';
import {ReportRepository} from './report.repository';
import {ProductGroupRepository} from './product-group.repository';
import {CashRegisterSystemRepository} from './cash-register-system.repository';
import {CurrencyRepository} from './currency.repository';
import {TermsUrlRepository} from './terms-url.repository';
import {ChatfuelCredentialsRepository} from './chatfuel-credentials.repository';
import {DeliveryCostRepository} from './delivery-cost.repository';

export class RestaurantRepository extends DefaultCrudRepository<
  Restaurant,
  typeof Restaurant.prototype.id,
  RestaurantRelations
  > {

  public readonly orders: HasManyRepositoryFactory<Order, typeof Restaurant.prototype.id>;

  public readonly itemSubcategories: HasManyRepositoryFactory<ItemSubcategory, typeof Restaurant.prototype.id>;

  public readonly tables: HasManyRepositoryFactory<Table, typeof Restaurant.prototype.id>;

  public readonly receipts: HasManyRepositoryFactory<Receipt, typeof Restaurant.prototype.id>;

  public readonly reports: HasManyRepositoryFactory<Report, typeof Restaurant.prototype.id>;

  public readonly productGroups: HasManyRepositoryFactory<ProductGroup, typeof Restaurant.prototype.id>;

  public readonly cashRegisterSystems: HasManyRepositoryFactory<CashRegisterSystem, typeof Restaurant.prototype.id>;

  public readonly currency: BelongsToAccessor<Currency, typeof Restaurant.prototype.id>;

  public readonly termsUrl: HasOneRepositoryFactory<TermsUrl, typeof Restaurant.prototype.id>;

  public readonly chatfuelCredentials: HasOneRepositoryFactory<ChatfuelCredentials, typeof Restaurant.prototype.id>;

  public readonly deliveryCost: HasOneRepositoryFactory<DeliveryCost, typeof Restaurant.prototype.id>;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource, @repository.getter('OrderRepository') protected orderRepositoryGetter: Getter<OrderRepository>, @repository.getter('ItemSubcategoryRepository') protected itemSubcategoryRepositoryGetter: Getter<ItemSubcategoryRepository>, @repository.getter('TableRepository') protected tableRepositoryGetter: Getter<TableRepository>, @repository.getter('ReceiptRepository') protected receiptRepositoryGetter: Getter<ReceiptRepository>, @repository.getter('ReportRepository') protected reportRepositoryGetter: Getter<ReportRepository>, @repository.getter('ProductGroupRepository') protected productGroupRepositoryGetter: Getter<ProductGroupRepository>, @repository.getter('CashRegisterSystemRepository') protected cashRegisterSystemRepositoryGetter: Getter<CashRegisterSystemRepository>, @repository.getter('CurrencyRepository') protected currencyRepositoryGetter: Getter<CurrencyRepository>, @repository.getter('TermsUrlRepository') protected termsUrlRepositoryGetter: Getter<TermsUrlRepository>, @repository.getter('ChatfuelCredentialsRepository') protected chatfuelCredentialsRepositoryGetter: Getter<ChatfuelCredentialsRepository>, @repository.getter('DeliveryCostRepository') protected deliveryCostRepositoryGetter: Getter<DeliveryCostRepository>,
  ) {
    super(Restaurant, dataSource);
    this.deliveryCost = this.createHasOneRepositoryFactoryFor('deliveryCost', deliveryCostRepositoryGetter);
    this.registerInclusionResolver('deliveryCost', this.deliveryCost.inclusionResolver);
    this.chatfuelCredentials = this.createHasOneRepositoryFactoryFor('chatfuelCredentials', chatfuelCredentialsRepositoryGetter);
    this.registerInclusionResolver('chatfuelCredentials', this.chatfuelCredentials.inclusionResolver);
    this.termsUrl = this.createHasOneRepositoryFactoryFor('termsUrl', termsUrlRepositoryGetter);
    this.registerInclusionResolver('termsUrl', this.termsUrl.inclusionResolver);
    this.currency = this.createBelongsToAccessorFor('currency', currencyRepositoryGetter,);
    this.registerInclusionResolver('currency', this.currency.inclusionResolver);
    this.cashRegisterSystems = this.createHasManyRepositoryFactoryFor('cashRegisterSystems', cashRegisterSystemRepositoryGetter,);
    this.registerInclusionResolver('cashRegisterSystems', this.cashRegisterSystems.inclusionResolver);
    this.productGroups = this.createHasManyRepositoryFactoryFor('productGroups', productGroupRepositoryGetter,);
    this.registerInclusionResolver('productGroups', this.productGroups.inclusionResolver);
    this.reports = this.createHasManyRepositoryFactoryFor('reports', reportRepositoryGetter,);
    this.registerInclusionResolver('reports', this.reports.inclusionResolver);
    this.receipts = this.createHasManyRepositoryFactoryFor('receipts', receiptRepositoryGetter,);
    this.registerInclusionResolver('receipts', this.receipts.inclusionResolver);
    this.tables = this.createHasManyRepositoryFactoryFor('tables', tableRepositoryGetter,);
    this.registerInclusionResolver('tables', this.tables.inclusionResolver);
    this.itemSubcategories = this.createHasManyRepositoryFactoryFor('itemSubcategories', itemSubcategoryRepositoryGetter);
    this.orders = this.createHasManyRepositoryFactoryFor('orders', orderRepositoryGetter,);
    this.registerInclusionResolver('orders', this.orders.inclusionResolver);
  }
}
