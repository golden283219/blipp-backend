export type PaymentOperations = {
  method: string;
  href: string;
  rel: string;
  contentType: string;
};

export type PaymentType = 'Swish' | 'CreditCard';

export type PaymentInfoTypes = {
  orderId: number;
  paymentType: PaymentType;
  phoneNumber: string;
};

export enum PaymentStates {
  COMPLETED = 'Completed',
  FAILED = 'Failed',
}
export enum PaymentTypes {
  SWISH = 'Swish',
  CREDITCARD = 'CreditCard',
}

export enum PaymentEndpoints {
  SWISH_ENDPOINT = '/psp/swish/payments',
  CARD_ENDPOINT = '/psp/creditcard/payments',
}
