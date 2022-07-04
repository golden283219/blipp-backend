import {authenticate} from '@loopback/authentication';
import {authorize} from '@loopback/authorization';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  param,
  patch,
  post,
  put,
  requestBody
} from '@loopback/rest';
import {Report} from '../models';
import {
  CurrencyRepository,
  ItemVariantOptionRepository,
  OrderedItemRepository,
  OrderRepository,
  ProductGroupRepository,
  ReceiptRepository,
  ReportRepository,
  RestaurantRepository,
  TableRepository
} from '../repositories';
import {pdfEmailService} from '../services/email-service';
import {EmailSubjectTypes} from '../types/emailTypes';
import {AuthorizationRoles} from '../types/jwt';
import {ReportType} from '../types/reportTypes';
import {createEmailSubject} from '../utils/emailUtils';
import {reportTemplate} from '../utils/reportTemplate';
import {generateReport} from '../utils/reportUtils';

@authenticate('jwt')
export class ReportController {
  constructor(
    @repository(ReportRepository)
    public reportRepository: ReportRepository,
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
    @repository(CurrencyRepository)
    public currencyRepository: CurrencyRepository,
  ) {}

  @authorize({
    allowedRoles: [AuthorizationRoles.RESTAURANT, AuthorizationRoles.ADMIN],
  })
  @post('/reports', {
    responses: {
      '200': {
        description: 'Report model instance',
        content: {'application/json': {schema: getModelSchemaRef(Report)}},
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              restaurantId: {
                type: 'number',
              },
              reportType: {
                type: 'string',
              },
            },
          },
        },
      },
    })
    reportInput: {
      restaurantId: number;
      reportType: ReportType;
    },
  ): Promise<Report> {
    const {restaurantId, reportType} = reportInput;
    const report = await generateReport({
      reportType,
      restaurantId,
      restaurantRepository: this.restaurantRepository,
      orderRepository: this.orderRepository,
      orderedItemRepository: this.orderedItemRepository,
      receiptRepository: this.receiptRepository,
      productGroupRepository: this.productGroupRepository,
      itemVariantOptionRepository: this.itemVariantOptionRepository,
      tableRepository: this.tableRepository,
    });

    return this.reportRepository.create(report);
  }

  @authorize({
    allowedRoles: [AuthorizationRoles.RESTAURANT, AuthorizationRoles.ADMIN],
  })
  @patch('/report/{id}/email', {
    responses: {
      '204': {
        description: 'Report pdf generated',
      },
    },
  })
  async emailReport(@param.path.number('id') id: number) {
    const report = await this.reportRepository.findById(id);
    const { email, currencyId, timezone } = await this.restaurantRepository.findById(
      report.restaurantId,
    );
    const currency = await this.currencyRepository.findById(currencyId);
    const template = reportTemplate(report, currency, timezone);
    const subject = createEmailSubject(
      EmailSubjectTypes.REPORT,
      report.timestamp,
      timezone
    );
    return pdfEmailService(template, id, email, subject);
  }

  @get('/reports/count', {
    responses: {
      '200': {
        description: 'Report model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(@param.where(Report) where?: Where<Report>): Promise<Count> {
    return this.reportRepository.count(where);
  }

  @authorize({
    allowedRoles: [AuthorizationRoles.RESTAURANT, AuthorizationRoles.ADMIN],
  })
  @get('/reports', {
    responses: {
      '200': {
        description: 'Array of Report model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Report, {includeRelations: true}),
            },
          },
        },
      },
    },
  })
  async find(@param.filter(Report) filter?: Filter<Report>): Promise<Report[]> {
    return this.reportRepository.find(filter);
  }

  @authorize({
    allowedRoles: [AuthorizationRoles.ADMIN],
  })
  @patch('/reports', {
    responses: {
      '200': {
        description: 'Report PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Report, {partial: true}),
        },
      },
    })
    report: Report,
    @param.where(Report) where?: Where<Report>,
  ): Promise<Count> {
    return this.reportRepository.updateAll(report, where);
  }

  @authorize({
    allowedRoles: [AuthorizationRoles.RESTAURANT, AuthorizationRoles.ADMIN],
  })
  @get('/reports/{id}', {
    responses: {
      '200': {
        description: 'Report model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Report, {includeRelations: true}),
          },
        },
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Report, {exclude: 'where'})
    filter?: FilterExcludingWhere<Report>,
  ): Promise<Report> {
    return this.reportRepository.findById(id, filter);
  }

  @authorize({
    allowedRoles: [AuthorizationRoles.ADMIN],
  })
  @patch('/reports/{id}', {
    responses: {
      '204': {
        description: 'Report PATCH success',
      },
    },
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Report, {partial: true}),
        },
      },
    })
    report: Report,
  ): Promise<void> {
    await this.reportRepository.updateById(id, report);
  }

  @authorize({
    allowedRoles: [AuthorizationRoles.ADMIN],
  })
  @put('/reports/{id}', {
    responses: {
      '204': {
        description: 'Report PUT success',
      },
    },
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() report: Report,
  ): Promise<void> {
    await this.reportRepository.replaceById(id, report);
  }

  @authorize({
    allowedRoles: [AuthorizationRoles.ADMIN],
  })
  @del('/reports/{id}', {
    responses: {
      '204': {
        description: 'Report DELETE success',
      },
    },
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.reportRepository.deleteById(id);
  }
}
