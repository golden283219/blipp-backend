import short from 'short-uuid';
import paymentTemplate from '../constants/paymentPostTemplate.json';
import reversalTemplate from '../constants/reversalPostTemplate.json';
import {MerchantCredentials, Order, OrderRelations, TermsUrl} from '../models';
import {PaymentInfo} from '../models/payment-info.model';
import {Vat} from '../models/vat.model';
import {PaymentInfoRepository} from '../repositories/payment-info.repository';
import {PaymentType, PaymentTypes} from '../types/paymentTypes';

export const generatePaymentPayload = (
  orderId: number,
  paymentType: PaymentType,
  total: number,
  payeeReference: string,
  vats: Vat[],
  merchantCredentials: MerchantCredentials,
  terms: TermsUrl,
  messengerId?: string,
  phoneNumber?: string,
) => {
  const {merchantId, merchantName} = merchantCredentials;
  const prices = handlePrices(paymentType, total, vats);
  const payeeInfo = handlePayeeInfo(
    paymentTemplate.payment.payeeInfo,
    payeeReference,
    merchantId,
    merchantName,
  );
  const urls = handleUrls(orderId, paymentType, terms, messengerId);
  const jsonPayload = {
    payment: {
      ...paymentTemplate.payment,
      intent: paymentType === 'Swish' ? 'Sale' : 'AutoCapture',
      prices,
      urls,
      payeeInfo,
      prefillInfo: {
        msisdn: phoneNumber,
      },
    },
  } as typeof paymentTemplate;

  return {jsonPayload, prices};
};

type Prices = {
  type: PaymentType;
  amount: number;
  vatAmount: number;
};
const handlePrices = (
  type: PaymentType,
  total: number,
  vats: Vat[],
): [Prices] => {
  let vatAmount = vats.reduce(
    (sum, {vat, gross}) => sum + gross * (vat / 100),
    0,
  );
  vatAmount = formatNumberSwePay(vatAmount.toFixed(2));
  const amount = formatNumberSwePay(total.toFixed(2));
  return [{type, amount, vatAmount}];
};

const formatNumberSwePay = (num: string) => +num.replace('.', '');

const handlePayeeInfo = (
  payeeInfo: typeof paymentTemplate.payment.payeeInfo,
  payeeReference: string,
  merchantId: string,
  merchantName: string,
) => {
  return {
    ...payeeInfo,
    payeeId: merchantId,
    payeeReference,
    payeeName: merchantName,
  };
};

const handleUrls = (
  orderId: number,
  paymentType: PaymentType,
  terms: TermsUrl,
  messengerId?: string,
) => {
  const paymentUrl =
    messengerId && paymentType === PaymentTypes.SWISH
      ? 'fb-messenger://app'
      : process.env.PAY_PAYMENT_URL;
  return {
    hostUrls: [`${process.env.PAY_HOST_URL}`],
    completeUrl: `${process.env.PAY_COMPLETE_URL}/?orderId=${orderId}&paymentType=${paymentType}`,
    termsOfServiceUrl: terms.url,
    paymentUrl,
    callbackUrl: process.env.PAY_CALLBACK_URL,
  };
};

export const addPaymentInfo = async (
  order: Order & OrderRelations,
  payeeReference: string,
  data: any,
  prices: [Prices],
  paymentInfoRepository: PaymentInfoRepository,
  payeeName: string | undefined,
) => {
  const {type, amount, vatAmount} = prices[0];

  const existingPaymentInfo = await paymentInfoRepository.findOne({
    where: {orderId: order.id},
  });
  if (existingPaymentInfo) {
    await paymentInfoRepository.deleteById(existingPaymentInfo.id);
  }

  const paymentInfo = new PaymentInfo({
    payeeReference,
    payeeName,
    type,
    amount,
    vatAmount,
    paymentId: data.payment.id,
    orderId: order.id,
  });
  await paymentInfoRepository.create(paymentInfo);
};

export const getReversalJSON = (paymentInfo: PaymentInfo, orderId: number) => {
  const {amount, vatAmount} = paymentInfo;
  const payeeReference = `${orderId}-${short.generate()}`;
  const reversalPayload = {
    transaction: {amount, vatAmount, description: 'Reversal', payeeReference},
  } as typeof reversalTemplate;
  return reversalPayload;
};
