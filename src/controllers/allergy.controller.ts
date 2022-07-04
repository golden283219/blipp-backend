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
import {Allergy} from '../models';
import {AllergyRepository} from '../repositories';
import {AuthorizationRoles} from '../types/jwt';

@authenticate('jwt')
export class AllergyController {
  constructor(
    @repository(AllergyRepository)
    public allergyRepository: AllergyRepository,
  ) {}

  @authorize({
    allowedRoles: [AuthorizationRoles.ADMIN],
  })
  @post('/allergies', {
    responses: {
      '200': {
        description: 'Allergy model instance',
        content: {'application/json': {schema: getModelSchemaRef(Allergy)}},
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Allergy, {
            title: 'NewAllergy',
            exclude: ['id'],
          }),
        },
      },
    })
    allergy: Omit<Allergy, 'id'>,
  ): Promise<Allergy> {
    return this.allergyRepository.create(allergy);
  }

  @authorize({
    allowedRoles: [AuthorizationRoles.ADMIN],
  })
  @get('/allergies/count', {
    responses: {
      '200': {
        description: 'Allergy model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(@param.where(Allergy) where?: Where<Allergy>): Promise<Count> {
    return this.allergyRepository.count(where);
  }

  @authorize({
    allowedRoles: [AuthorizationRoles.RESTAURANT, AuthorizationRoles.ADMIN],
  })
  @get('/allergies', {
    responses: {
      '200': {
        description: 'Array of Allergy model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Allergy, {includeRelations: true}),
            },
          },
        },
      },
    },
  })
  async find(
    @param.filter(Allergy) filter?: Filter<Allergy>,
  ): Promise<Allergy[]> {
    return this.allergyRepository.find(filter);
  }

  @authorize({
    allowedRoles: [AuthorizationRoles.ADMIN],
  })
  @patch('/allergies', {
    responses: {
      '200': {
        description: 'Allergy PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Allergy, {partial: true}),
        },
      },
    })
    allergy: Allergy,
    @param.where(Allergy) where?: Where<Allergy>,
  ): Promise<Count> {
    return this.allergyRepository.updateAll(allergy, where);
  }

  @authorize({
    allowedRoles: [AuthorizationRoles.RESTAURANT, AuthorizationRoles.ADMIN],
  })
  @get('/allergies/{id}', {
    responses: {
      '200': {
        description: 'Allergy model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Allergy, {includeRelations: true}),
          },
        },
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Allergy, {exclude: 'where'})
    filter?: FilterExcludingWhere<Allergy>,
  ): Promise<Allergy> {
    return this.allergyRepository.findById(id, filter);
  }

  @authorize({
    allowedRoles: [AuthorizationRoles.ADMIN],
  })
  @patch('/allergies/{id}', {
    responses: {
      '204': {
        description: 'Allergy PATCH success',
      },
    },
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Allergy, {partial: true}),
        },
      },
    })
    allergy: Allergy,
  ): Promise<void> {
    await this.allergyRepository.updateById(id, allergy);
  }

  @authorize({
    allowedRoles: [AuthorizationRoles.ADMIN],
  })
  @put('/allergies/{id}', {
    responses: {
      '204': {
        description: 'Allergy PUT success',
      },
    },
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() allergy: Allergy,
  ): Promise<void> {
    await this.allergyRepository.replaceById(id, allergy);
  }

  @authorize({
    allowedRoles: [AuthorizationRoles.ADMIN],
  })
  @del('/allergies/{id}', {
    responses: {
      '204': {
        description: 'Allergy DELETE success',
      },
    },
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.allergyRepository.deleteById(id);
  }
}
