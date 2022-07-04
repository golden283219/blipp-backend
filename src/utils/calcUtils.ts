import {Vat} from '../models';

export const calcRoundingTotal = (num: number) => {
  const decimal = Math.round(num) - num;
  return parseFloat(decimal.toFixed(2));
};

export const calcVatTotal = (reportVats: Vat[]) => {
  const newReportVats = reportVats.map(rVat => {
    const {vat, gross} = rVat;

    const vatAmount = (gross / 100) * vat;
    const net = gross - vatAmount;
    return {vatAmount, net};
  });
  const totalNet = newReportVats.reduce((sum, vat) => sum + vat.net, 0);
  const totalVatAmount = newReportVats.reduce(
    (sum, vat) => sum + vat.vatAmount,
    0,
  );
  return {totalNet, totalVatAmount};
};
