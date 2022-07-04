import {authenticate} from '@loopback/authentication';
import {authorize} from '@loopback/authorization';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  param,
  patch,
  post,
  put,
  requestBody,
} from '@loopback/rest';
import {getTableCallbackName, tableCallbacks} from '../components/callbacks';
import {Table} from '../models';
import pubsub from '../pubsub';
import {TableRepository} from '../repositories';
import {AuthorizationRoles} from '../types/jwt';

export class TableController {
  constructor(
    @repository(TableRepository)
    public tableRepository: TableRepository,
  ) {}

  async notifyRestaurant(restaurantId: number) {
    const filter = {
      where: {restaurantId, needsService: true},
      order: ['lastServiceCall DESC'],
    };
    const tables = await this.tableRepository.find(filter);
    const topic = getTableCallbackName(`${restaurantId}`);
    console.log('topic', topic);
    const payload = tables;
    await pubsub.publish(topic, payload);
  }

  @authenticate('jwt')
  @authorize({
    allowedRoles: [AuthorizationRoles.ADMIN],
  })
  @post('/tables', {
    responses: {
      '200': {
        description: 'Table model instance',
        content: {'application/json': {schema: getModelSchemaRef(Table)}},
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Table, {
            title: 'NewTable',
            exclude: ['id'],
          }),
        },
      },
    })
    table: Omit<Table, 'id'>,
  ): Promise<Table> {
    return this.tableRepository.create(table);
  }

  @authenticate('jwt')
  @authorize({
    allowedRoles: [AuthorizationRoles.ADMIN],
  })
  @get('/tables/count', {
    responses: {
      '200': {
        description: 'Table model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(@param.where(Table) where?: Where<Table>): Promise<Count> {
    return this.tableRepository.count(where);
  }

  @authenticate('jwt')
  @authorize({
    allowedRoles: [AuthorizationRoles.RESTAURANT, AuthorizationRoles.ADMIN],
  })
  @get('/tables', {
    responses: {
      '200': {
        description: 'Array of Table model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Table, {includeRelations: true}),
            },
          },
        },
      },
    },
  })
  async find(@param.filter(Table) filter?: Filter<Table>): Promise<Table[]> {
    return this.tableRepository.find(filter);
  }

  @authenticate('jwt')
  @authorize({
    allowedRoles: [AuthorizationRoles.ADMIN],
  })
  @get('/tables/{id}', {
    operationId: 'getTable',
    responses: {
      '200': {
        description: 'Table model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Table, {includeRelations: true}),
          },
        },
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Table, {exclude: 'where'})
    filter?: FilterExcludingWhere<Table>,
  ): Promise<Table> {
    return this.tableRepository.findById(id, filter);
  }

  @authenticate('jwt')
  @authorize({
    allowedRoles: [
      AuthorizationRoles.CUSTOMER,
      AuthorizationRoles.RESTAURANT,
      AuthorizationRoles.ADMIN,
    ],
  })
  @patch('/tables/{id}', {
    responses: {
      '204': {
        description: 'Table model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Table, {includeRelations: true}),
          },
        },
      },
    },
    callbacks: {
      tableCallbacks,
    },
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Table, {partial: true}),
        },
      },
    })
    table: Table,
  ): Promise<Table> {
    const existingTable = await this.tableRepository.findById(id);
    const askedForService = !existingTable.needsService && table.needsService;
    const lastServiceCall = new Date().toISOString();
    const newTable = askedForService ? {...table, lastServiceCall} : table;
    await this.tableRepository.updateById(id, newTable);
    const updatedTable = await this.tableRepository.findById(id);
    await this.notifyRestaurant(updatedTable?.restaurantId);
    return updatedTable;
  }

  @authenticate('jwt')
  @authorize({
    allowedRoles: [AuthorizationRoles.ADMIN],
  })
  @put('/tables/{id}', {
    responses: {
      '204': {
        description: 'Table PUT success',
      },
    },
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() table: Table,
  ): Promise<void> {
    await this.tableRepository.replaceById(id, table);
  }

  @authenticate('jwt')
  @authorize({
    allowedRoles: [AuthorizationRoles.ADMIN],
  })
  @del('/tables/{id}', {
    responses: {
      '204': {
        description: 'Table DELETE success',
      },
    },
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.tableRepository.deleteById(id);
  }
}
