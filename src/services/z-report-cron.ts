import {CronJob, cronJob} from '@loopback/cron';
import {repository} from '@loopback/repository';
import {
  CurrencyRepository,
  ItemVariantOptionRepository,
  OrderedItemRepository,
  OrderRepository,
  ProductGroupRepository,
  ReceiptRepository,
  ReportRepository,
  RestaurantRepository,
  TableRepository,
} from '../repositories';
import {ReportTypes} from '../types';
import {EmailSubjectTypes} from '../types/emailTypes';
import {createEmailSubject} from '../utils/emailUtils';
import {reportTemplate} from '../utils/reportTemplate';
import {generateReport, zReportCronTime} from '../utils/reportUtils';
import {pdfEmailService} from './email-service';

@cronJob()
export class ReportCron extends CronJob {
  constructor(
    @repository(RestaurantRepository)
    public restaurantRepository: RestaurantRepository,
    @repository(OrderRepository)
    public orderRepository: OrderRepository,
    @repository(OrderedItemRepository)
    public orderedItemRepository: OrderedItemRepository,
    @repository(ReceiptRepository)
    public receiptRepository: ReceiptRepository,
    @repository(ProductGroupRepository)
    public productGroupRepository: ProductGroupRepository,
    @repository(ItemVariantOptionRepository)
    public itemVariantOptionRepository: ItemVariantOptionRepository,
    @repository(TableRepository)
    public tableRepository: TableRepository,
    @repository(ReportRepository)
    public reportRepository: ReportRepository,
    @repository(CurrencyRepository)
    public currencyRepository: CurrencyRepository,
  ) {
    super({
      name: 'z-report',
      onTick: async () => {
        const restaurants = await this.restaurantRepository.find();

        for (const restaurant of restaurants) {
          const {id, email, currencyId, timezone} = restaurant;
          const generatedReport = await generateReport({
            reportType: ReportTypes.Z,
            restaurantId: id,
            restaurantRepository: this.restaurantRepository,
            orderRepository: this.orderRepository,
            orderedItemRepository: this.orderedItemRepository,
            receiptRepository: this.receiptRepository,
            productGroupRepository: this.productGroupRepository,
            itemVariantOptionRepository: this.itemVariantOptionRepository,
            tableRepository: this.tableRepository,
          });

          const report = await this.reportRepository.create(generatedReport);
          const currency = await this.currencyRepository.findById(currencyId);

          const template = reportTemplate(report, currency, timezone);
          const subject = createEmailSubject(
            EmailSubjectTypes.REPORT,
            report.timestamp,
            timezone,
          );
          await pdfEmailService(template, report.id!, email, subject);
        }
      },
      cronTime: zReportCronTime,
      start: false,
      timeZone: 'Europe/Stockholm',
    });
  }
}
