import {authenticate} from '@loopback/authentication';
import {authorize} from '@loopback/authorization';
import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  getWhereSchemaFor,
  param,
  patch,
  post,
  requestBody,
} from '@loopback/rest';
import {User, UserCredential} from '../models';
import {UserRepository} from '../repositories';
import {AuthorizationRoles} from '../types/jwt';

@authenticate('jwt')
@authorize({
  allowedRoles: [AuthorizationRoles.ADMIN],
})
export class UserUserCredentialController {
  constructor(
    @repository(UserRepository) protected userRepository: UserRepository,
  ) {}

  @get('/users/{id}/user-credential', {
    responses: {
      '200': {
        description: 'User has one UserCredential',
        content: {
          'application/json': {
            schema: getModelSchemaRef(UserCredential),
          },
        },
      },
    },
  })
  async get(
    @param.path.number('id') id: number,
    @param.query.object('filter') filter?: Filter<UserCredential>,
  ): Promise<UserCredential> {
    return this.userRepository.userCredential(id).get(filter);
  }

  @post('/users/{id}/user-credential', {
    responses: {
      '200': {
        description: 'User model instance',
        content: {
          'application/json': {schema: getModelSchemaRef(UserCredential)},
        },
      },
    },
  })
  async create(
    @param.path.number('id') id: typeof User.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UserCredential, {
            title: 'NewUserCredentialInUser',
            exclude: ['id'],
            optional: ['userId'],
          }),
        },
      },
    })
    userCredential: Omit<UserCredential, 'id'>,
  ): Promise<UserCredential> {
    return this.userRepository.userCredential(id).create(userCredential);
  }

  @patch('/users/{id}/user-credential', {
    responses: {
      '200': {
        description: 'User.UserCredential PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UserCredential, {partial: true}),
        },
      },
    })
    userCredential: Partial<UserCredential>,
    @param.query.object('where', getWhereSchemaFor(UserCredential))
    where?: Where<UserCredential>,
  ): Promise<Count> {
    return this.userRepository.userCredential(id).patch(userCredential, where);
  }

  @del('/users/{id}/user-credential', {
    responses: {
      '200': {
        description: 'User.UserCredential DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(UserCredential))
    where?: Where<UserCredential>,
  ): Promise<Count> {
    return this.userRepository.userCredential(id).delete(where);
  }
}
