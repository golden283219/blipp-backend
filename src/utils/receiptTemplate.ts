import {Receipt} from '../models';
import {PaymentTypes} from '../types/paymentTypes';
import {convertToLocalTime} from '../utils/timeUtils';
import {calcVatTotal} from './calcUtils';

export const receiptTemplate = (
  receipt: Receipt,
  timezone: string,
  isOriginal?: boolean,
) => {
  const {
    restaurantName,
    address,
    orgnr,
    restaurantPhoneNumber,
    date,
    items,
    ka,
    sn,
    rounding,
    total,
    paymentMethod,
    receiptVat,
    receiptCurrency: {locale, currency},
    cardType,
    cardNumber,
    isReturnReceipt,
    deliveryCostInfo,
  } = receipt;

  const deliveryCost = deliveryCostInfo && JSON.parse(deliveryCostInfo);
  const {format} = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  });

  const {totalVatAmount} = calcVatTotal(receiptVat);

  return `<!DOCTYPE html>
<html lang="se">
  <head></head>
  <body>
    <div class="container">
      <div class="container-center">
      ${isOriginal ? '' : '<h2>***KVITTO KOPIA***</h2>'}
        <h1>${restaurantName}</h1>
      </div>
      <div class="container-center">
        <p>${address}</p>
        <p>Tel: ${restaurantPhoneNumber}</p>
        <p>Orgnr: ${orgnr}</p>
      </div>

      <p>Datum: ${convertToLocalTime(date, timezone)}</p>
      <p>KA: ${ka}</p>

      ${
        isReturnReceipt
          ? `<div class="container-center">
        <p class="textBold">Retur</p>
        <p class="textBold">Godkänd</p>
      </div>`
          : ''
      }

      <hr class="dotted" />

      ${items
        .map(item => {
          const {name, price, quantity, variants, allergies} = item;
          return `<div class="key-value-row">
          <p>${quantity}x ${name}</p>
          <p>${price > 0 ? format(price) : ''}</p>
        </div>
        ${variants.map(variant => {
          return `<div class="key-value-row">
          <p class="indent">+ ${variant.name}</p>
          <p>${
            variant.price && variant.price > 0 ? format(variant.price) : ''
          }</p>
          </div>`;
        })}
        ${allergies
          .map(allergy => `<p class="indent">- ${allergy}</p>`)
          .join('')}
        `;
        })
        .join('')}

      <hr class="dotted" />

      <div class="key-value-row">
        <p>Utkörningsavgift</p>
        <p>${format(deliveryCost.gross)}</p>
      </div>
      <div class="key-value-row">
        <p>Öresavrundning</p>
        <p>${format(rounding)}</p>
      </div>
      <div class="key-value-row">
        <p>TOTALT</p>
        <p>${format(total)}</p>
      </div>

      ${receiptVat
        .map(rVat => {
          const {vat, gross} = rVat;
          const vatAmount = (gross / 100) * vat;
          return `<div class="key-value-row">
          <p>${vat}%</p>
          <p>${format(vatAmount)}</p>
      </div>`;
        })
        .join('')}

        <div class="key-value-row">
        <p>Total vat:</p>
        <p>${format(totalVatAmount)}</p>
      </div>

        ${
          paymentMethod === PaymentTypes.SWISH
            ? `<p>Betalat med ${paymentMethod}</p>`
            : `<p>Betalat med ${cardType}</p><p>${cardNumber}</p>`
        }
        <p>Sn: ${sn}</p>

    </div>
  </body>
  <style>
    p,
    h3 {
      margin: 8px 0;
    }
    .container {
      width: 400px;
      padding: 16px 32px;
      border: 1px solid lightgrey;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .dashed {
      margin: 12px 0;
      border-top: 2px dashed grey;
    }
    .dotted {
      margin: 12px 0;
      border-top: 2px dotted grey;
    }
    .key-value-row {
      display: flex;
      justify-content: space-between;
    }
    .key-value-row p:last-child {
      text-align: right;
    }
    .group-level p {
      text-align: left;
    }
    .price-container p {
      text-align: right;
    }
    .container-center {
      text-align: center;
    }
    .container-right {
      text-align: right;
    }
    .container-left {
      text-align: left;
    }
    .indent {
      margin-left: 16px;
    }
    .textBold {
      font-weight: bold;
      text-align: center;
    }
    .grid-quarter{
      display: grid;
      grid-template-columns: repeat(4, 1fr);
    }
  </style>
</html>
`;
};
