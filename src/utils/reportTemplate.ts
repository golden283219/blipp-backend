import {Currency} from '../models';
import {Report} from '../models/report.model';
import {calcRoundingTotal, calcVatTotal} from './calcUtils';
import {convertToLocalTime} from './timeUtils';

export const reportTemplate = (
  report: Report,
  restaurantCurrency: Currency,
  timezone: string
) => {
  const {
    reportType,
    totalOrders,
    startDate,
    endDate,
    timestamp,
    name,
    address,
    orgnr,
    checkout,
    cashier,
    reportPaymentMethods,
    reportProductGroup,
    reportVat,
    reportReturnedReceipts,
    reportOpenOrder,
    itemsReturned,
    reportGrandTotal,
  } = report;
  const {currency, locale} = restaurantCurrency;

  const {format} = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  });

  const todaysTotal = reportPaymentMethods.reduce(
    (sum, total) => sum + total.total!,
    0,
  );

  const returnedTotal = reportReturnedReceipts.reduce(
    (sum, returnedReceipt) => sum + returnedReceipt.total,
    0,
  );

  const {totalNet, totalVatAmount} = calcVatTotal(reportVat);

  return `<!DOCTYPE html>
<html lang="se">
  <head></head>
  <body>
    <div class="container">
      <div class="container-center">
        <h1>${reportType}-RAPPORT</h1>
      </div>

      <hr class="dashed" />

      <div class="container-center">
        <p>DATUM:</p>
        <p>FRÅN: ${convertToLocalTime(startDate, timezone)}</p>
        <p>TILL: ${convertToLocalTime(endDate, timezone)}</p>
        <p>KASSAREGISTER: ${checkout}</p>
      </div>

      <hr class="dotted" />

      <div class="container-center">
      <p>UTSKRIVET AV: ${cashier}</p>
      <p>UTSKRIVET TID: ${convertToLocalTime(timestamp, timezone) }</p>
    </div>

      <hr class="dotted" />

      <div class="container-center">
        <p>${name}</p>
        <p>${address}</p>
        <p>Org nr: ${orgnr}</p>
      </div>

      <hr class="dotted" />

      <h3>BETALSÄTT</h3>
      <hr class="dashed" />
      ${reportPaymentMethods
        .map(({paymentMethod, orders, total}) => {
          return `<div class="key-value-row">
            <p>${orders}x ${paymentMethod}</p>
            <p>${format(total!)}</p>
          </div>
          `;
        })
        .join('')}
        <hr class="dotted" />
        <div class="key-value-row">
        <p>TOTALT:</p>
          <p>${format(todaysTotal)}</p>
          </div>

          <hr class="dotted" />

      <h3>GRUPPNIVÅ 1</h3>
      <hr class="dashed" />
      ${reportProductGroup
        .map(
          ({name: productGroupName, vat, accountPlan, total, items}) =>
            `<div class="grid-quarter">
        <div class="container-left">
            <p>${items}x</p>
        </div>
        <div class="container-center">
            <p>${productGroupName}</p>
            <p><b>${vat}%</b></p>
        </div>
        <div class="container-center">
            <p>(${accountPlan})</p>
        </div>
        <div class="container-right">
            <p>${format(total)}</p>
            <p>${format(calcRoundingTotal(total))}</p>
        </div>
      </div>`,
        )
        .join('')}

      <hr class="dotted" />
      <div class="key-value-row">
      <div class="container-right">
        <p>Total produkter</p>
      </div>
      <div class="container-right">
        <p>${reportProductGroup.reduce(
          (sum, productGroup) => sum + productGroup.items,
          0,
        )}</p>
      </div>
    </div>
      <div class="key-value-row">
        <div class="container-right">
          <p><b>GRUPPNIVÅ 1 TOTALT</b></p>
          <div><br /></div>
          <div><br /></div>
        </div>
        <div class="container-right">
          <p><b>${format(todaysTotal)}</b></p>
        </div>
      </div>
      <h3>MOMS</h3>
      <hr class="dashed" />
      <div class="grid-quarter">
        <div class="container-left">
        <div><br /></div>
        </div>
        <div class="container-center">
          <p>Ex moms</p>
        </div>
        <div class="container-center">
          <p>Moms</p>
        </div>
        <div class="container-right">
          <p>Totalt</p>
        </div>
      </div>
      ${reportVat
        .map(rVat => {
          const {vat, gross} = rVat;

          const vatAmount = (gross / 100) * vat;
          const net = gross - vatAmount;

          return `<div class="grid-quarter">
        <div class="container-left">
          <p>${vat}%</p>
        </div>
        <div class="container-center">
          <p>${format(net)}</p>
        </div>
        <div class="container-center">
          <p>${format(vatAmount)}</p>
        </div>
        <div class="container-right">
          <p>${format(gross)}</p>
        </div>
      </div>`;
        })
        .join('')}

        <hr class="dotted" />

        ${(() => {
          return `<div class="grid-quarter">
          <div class="container-left">
          <div><br /></div>
          </div>
          <div class="container-center">
            <p>${format(totalNet)}</p>
          </div>
          <div class="container-center">
            <p>${format(totalVatAmount)}</p>
          </div>
          <div class="container-right">
            <p>${format(todaysTotal)}</p>
          </div>
        </div>`;
        })()}

        ${
          reportType === 'X'
            ? `<h3>ÖPPNA BORD</h3>
            <hr class="dashed" />
          ${reportOpenOrder
            .map(({tableName, total}) => {
              return `<div class="key-value-row">
                      <p>${tableName}</p>
                      <p>${format(total)}</p>
                      </div>`;
            })
            .join('')}

            <hr class="dotted" />

            <div class="key-value-row">
                      <p>Totalt</p>
                      <p>${format(
                        reportOpenOrder.reduce(
                          (sum, table) => sum + table.total,
                          0,
                        ),
                      )}</p>
                      </div>`
            : ''
        }


      <br />
      <h3>RETURER</h3>
      <hr class="dashed" />
      <div class="key-value-row">
        <p>RETURER - ${reportReturnedReceipts.length} stycken</p>
      </div>
      <div class="key-value-row">
        <p>RETURER - ${itemsReturned} artiklar</p>
        <p>${negativePrefix(returnedTotal, format)}</p>
      </div>
      <p><b>RETURER - BETALSÄTT</b></p>
      <hr class="dotted" />
      ${reportReturnedReceipts
        .map(
          ({total, paymentMethod}) =>
            `<div class="key-value-row">
        <p>1x (SEK) ${paymentMethod}</p>
        <p>${negativePrefix(total, format)}</p>
      </div>`,
        )
        .join('')}
      <div class="key-value-row">
        <p>TOTALT</p>
        <p>${negativePrefix(returnedTotal, format)}</p>
      </div>
      <br />
      <h3>RÄKNARE</h3>
      <hr class="dashed" />
      <div class="key-value-row">
        <p>GRAND TOTAL FÖRSÄLJNING:</p>
        <p>${format(reportGrandTotal.gross)}</p>
      </div>
      <div class="key-value-row">
        <p>GRAND TOTAL RETUR:</p>
        <p>${negativePrefix(reportGrandTotal.grossReturned, format)}</p>
      </div>
      <div class="key-value-row">
        <p>GRAND TOTAL NETTO:</p>
        <p>${format(
          reportGrandTotal.gross - reportGrandTotal.grossReturned,
        )}</p>
      </div>
      <hr class="dotted" />
      ${
        reportType === 'X'
          ? `<div class="key-value-row">
          <p><b>TOTALT BRUTTO</b></p>
          <p>${format(todaysTotal)}</p>
        </div>
        <div class="key-value-row">
          <p><b>TOTALT NETTO</b></p>
          <p>${format(totalNet)}</p>
        </div>
        <div class="key-value-row">
          <p><b>TOTALT MOMS</b></p>
          <p>${format(totalVatAmount)}</p>
        </div>
        <div class="key-value-row">
          <p><b>TOTALT NEGATIVE</b></p>
          <p>${negativePrefix(returnedTotal, format)}</p>
        </div>
        <div class="key-value-row">
          <p><b>TOTALT AVRUNDNING</b></p>
          <p>${format(calcRoundingTotal(totalNet))}</p>
        </div>
        <div class="key-value-row">
          <p><b>ANTAL KUNDER</b></p>
          <p>${totalOrders}</p>
        </div>
        <div class="key-value-row">
          <p><b>GENOMSNITTSFÖRSÄLJNING</b></p>
          <p>${format(todaysTotal / totalOrders)}</p>
        </div>`
          : ''
      }
      <div class="container-center">
        <p>*** SLUT ***</p>
      </div>
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
    .grid-quarter{
      display: grid;
      grid-template-columns: repeat(4, 1fr);
    }
  </style>
</html>
`;
};

const negativePrefix = (num: number, format: (price: number) => string) => {
  if (num === 0) return '0';
  return `-${format(num)}`;
};
