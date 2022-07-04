import {
  belongsTo,
  Entity,
  hasMany,
  hasOne,
  model,
  property,
} from '@loopback/repository';
import {CashRegisterSystem} from './cash-register-system.model';
import {ChatfuelCredentials} from './chatfuel-credentials.model';
import {Currency} from './currency.model';
import {DeliveryCost} from './delivery-cost.model';
import {ItemSubcategory} from './item-subcategory.model';
import {OpeningHours} from './opening-hours.model';
import {Order} from './order.model';
import {PreparationTime} from './preparation-time.model';
import {ProductGroup} from './product-group.model';
import {Receipt} from './receipt.model';
import {Report} from './report.model';
import {Table} from './table.model';
import {TermsUrl} from './terms-url.model';

@model()
export class Restaurant extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id: number;

  @property({
    type: 'string',
  })
  name: string;

  @property({
    type: 'string',
  })
  address: string;

  @property({
    type: 'string',
  })
  orgnr: string;

  @property({
    type: 'string',
  })
  phoneNumber: string;

  @property({
    type: 'string',
  })
  email: string;

  @property({
    type: 'string',
  })
  messengerUrl: string;

  @property({
    type: 'string',
  })
  about: string;

  @property({
    type: 'string',
  })
  coverImg: string;

  @property({
    type: 'string',
  })
  timezone: string;

  @property({
    type: 'boolean',
    default: true,
  })
  deliveryStatus: boolean;

  @property({
    type: 'boolean',
    default: true,
  })
  reservationStatus: boolean;

  @property({
    type: 'boolean',
  })
  takeawayStatus: boolean;

  @property.array(PreparationTime)
  preparationTimes: PreparationTime[];

  @property.array(OpeningHours)
  openingHours: OpeningHours[];

  @hasMany(() => Order)
  orders: Order[];

  @hasMany(() => ItemSubcategory)
  itemSubcategories: ItemSubcategory[];

  @hasMany(() => Table)
  tables: Table[];

  @hasMany(() => Receipt)
  receipts: Receipt[];

  @hasMany(() => Report)
  reports: Report[];

  @hasMany(() => ProductGroup)
  productGroups: ProductGroup[];

  @hasMany(() => CashRegisterSystem)
  cashRegisterSystems: CashRegisterSystem[];

  @belongsTo(() => Currency)
  currencyId: number;

  @hasOne(() => TermsUrl)
  termsUrl: TermsUrl;

  @hasOne(() => ChatfuelCredentials)
  chatfuelCredentials: ChatfuelCredentials;

  @hasOne(() => DeliveryCost)
  deliveryCost: DeliveryCost;

  constructor(data?: Partial<Restaurant>) {
    super(data);
  }
}

export interface RestaurantRelations {
  // describe navigational properties here
}

export type RestaurantWithRelations = Restaurant & RestaurantRelations;
