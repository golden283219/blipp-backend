import {ReceiptItemVariant} from '../models/receipt-item-variant.model';

export const itemVariantTotal = (variants: ReceiptItemVariant[]) =>
  variants.reduce((sum, variant) => sum! + variant.price!, 0);
