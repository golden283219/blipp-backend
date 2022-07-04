import {belongsTo, Entity, model, property} from '@loopback/repository';
import {ReportType} from '../types';
import {ReportGrandTotal} from './report-grand-total.model';
import {ReportOpenOrder} from './report-open-order.model';
import {ReportPaymentMethods} from './report-payment-methods.model';
import {ReportProductGroup} from './report-product-group.model';
import {ReportReturnedReceipts} from './report-returned-receipts.model';
import {Restaurant} from './restaurant.model';
import {Vat} from './vat.model';

@model()
export class Report extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'string',
  })
  reportType: ReportType;

  @property({
    type: 'date',
  })
  startDate: string;

  @property({
    type: 'date',
  })
  endDate: string;

  @property({
    type: 'date',
  })
  timestamp: string;

  @property({
    type: 'string',
  })
  checkout: string;

  @property({
    type: 'string',
  })
  cashier: string;

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
    type: 'number',
  })
  itemsReturned: number;

  @property({
    type: 'number',
  })
  totalOrders: number;

  @property({
    type: 'number',
  })
  receiptsReturned: number;

  @belongsTo(() => Restaurant)
  restaurantId: number;

  @property.array(ReportPaymentMethods)
  reportPaymentMethods: ReportPaymentMethods[];

  @property.array(ReportProductGroup)
  reportProductGroup: ReportProductGroup[];

  @property.array(Vat)
  reportVat: Vat[];

  @property.array(ReportOpenOrder)
  reportOpenOrder: ReportOpenOrder[];

  @property.array(ReportReturnedReceipts)
  reportReturnedReceipts: ReportReturnedReceipts[];

  @property({type: ReportGrandTotal})
  reportGrandTotal: ReportGrandTotal;

  constructor(data?: Partial<Report>) {
    super(data);
  }
}

export interface ReportRelations {
  // describe navigational properties here
}

export type ReportWithRelations = Report & ReportRelations;
