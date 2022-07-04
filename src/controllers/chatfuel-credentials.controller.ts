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
import {ChatfuelCredentials} from '../models';
import {ChatfuelCredentialsRepository} from '../repositories';
import {AuthorizationRoles} from '../types/jwt';

@authenticate('jwt')
@authorize({
  allowedRoles: [AuthorizationRoles.ADMIN],
})
export class ChatfuelCredentialsController {
  constructor(
    @repository(ChatfuelCredentialsRepository)
    public chatfuelCredentialsRepository: ChatfuelCredentialsRepository,
  ) {}

  @post('/chatfuel-credentials', {
    responses: {
      '200': {
        description: 'ChatfuelCredentials model instance',
        content: {
          'application/json': {schema: getModelSchemaRef(ChatfuelCredentials)},
        },
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ChatfuelCredentials, {
            title: 'NewChatfuelCredentials',
            exclude: ['id'],
          }),
        },
      },
    })
    chatfuelCredentials: Omit<ChatfuelCredentials, 'id'>,
  ): Promise<ChatfuelCredentials> {
    return this.chatfuelCredentialsRepository.create(chatfuelCredentials);
  }

  @get('/chatfuel-credentials/count', {
    responses: {
      '200': {
        description: 'ChatfuelCredentials model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.where(ChatfuelCredentials) where?: Where<ChatfuelCredentials>,
  ): Promise<Count> {
    return this.chatfuelCredentialsRepository.count(where);
  }

  @get('/chatfuel-credentials', {
    responses: {
      '200': {
        description: 'Array of ChatfuelCredentials model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(ChatfuelCredentials, {
                includeRelations: true,
              }),
            },
          },
        },
      },
    },
  })
  async find(
    @param.filter(ChatfuelCredentials) filter?: Filter<ChatfuelCredentials>,
  ): Promise<ChatfuelCredentials[]> {
    return this.chatfuelCredentialsRepository.find(filter);
  }

  @patch('/chatfuel-credentials', {
    responses: {
      '200': {
        description: 'ChatfuelCredentials PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ChatfuelCredentials, {partial: true}),
        },
      },
    })
    chatfuelCredentials: ChatfuelCredentials,
    @param.where(ChatfuelCredentials) where?: Where<ChatfuelCredentials>,
  ): Promise<Count> {
    return this.chatfuelCredentialsRepository.updateAll(
      chatfuelCredentials,
      where,
    );
  }

  @get('/chatfuel-credentials/{id}', {
    responses: {
      '200': {
        description: 'ChatfuelCredentials model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(ChatfuelCredentials, {
              includeRelations: true,
            }),
          },
        },
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(ChatfuelCredentials, {exclude: 'where'})
    filter?: FilterExcludingWhere<ChatfuelCredentials>,
  ): Promise<ChatfuelCredentials> {
    return this.chatfuelCredentialsRepository.findById(id, filter);
  }

  @patch('/chatfuel-credentials/{id}', {
    responses: {
      '204': {
        description: 'ChatfuelCredentials PATCH success',
      },
    },
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ChatfuelCredentials, {partial: true}),
        },
      },
    })
    chatfuelCredentials: ChatfuelCredentials,
  ): Promise<void> {
    await this.chatfuelCredentialsRepository.updateById(
      id,
      chatfuelCredentials,
    );
  }

  @put('/chatfuel-credentials/{id}', {
    responses: {
      '204': {
        description: 'ChatfuelCredentials PUT success',
      },
    },
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() chatfuelCredentials: ChatfuelCredentials,
  ): Promise<void> {
    await this.chatfuelCredentialsRepository.replaceById(
      id,
      chatfuelCredentials,
    );
  }

  @del('/chatfuel-credentials/{id}', {
    responses: {
      '204': {
        description: 'ChatfuelCredentials DELETE success',
      },
    },
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.chatfuelCredentialsRepository.deleteById(id);
  }
}
