import {Model, model, property} from '@loopback/repository';
import {ReceiptItemVariant} from './receipt-item-variant.model';
import {Vat} from './vat.model';

@model()
export class ReceiptItem extends Model {
  @property({
    type: 'string',
  })
  name: string;

  @property({
    type: 'number',
  })
  quantity: number;

  @property({
    type: 'number',
  })
  price: number;

  @property({
    type: 'number',
  })
  itemSubcategoryId: number;

  @property({
    type: 'number',
  })
  productGroupId: number;

  @property({
    type: 'object',
  })
  receiptItemVat: Vat;

  @property.array('string')
  allergies: string[];

  @property.array(ReceiptItemVariant)
  variants: ReceiptItemVariant[];

  constructor(data?: Partial<ReceiptItem>) {
    super(data);
  }
}

export interface ReceiptItemRelations {
  // describe navigational properties here
}

export type ReceiptItemWithRelations = ReceiptItem & ReceiptItemRelations;
