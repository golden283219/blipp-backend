import {Model, model, property} from '@loopback/repository';

@model()
export class ReceiptItemVariant extends Model {
  @property({
    type: 'string',
  })
  name?: string;

  @property({
    type: 'number',
  })
  price?: number;



  constructor(data?: Partial<ReceiptItemVariant>) {
    super(data);
  }
}

export interface ReceiptItemVariantRelations {
  // describe navigational properties here
}

export type ReceiptItemVariantWithRelations = ReceiptItemVariant & ReceiptItemVariantRelations;
