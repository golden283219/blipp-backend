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
import {ChatfuelBlock, ChatfuelCredentials} from '../models';
import {ChatfuelCredentialsRepository} from '../repositories';
import {AuthorizationRoles} from '../types/jwt';

@authenticate('jwt')
@authorize({
  allowedRoles: [AuthorizationRoles.ADMIN],
})
export class ChatfuelCredentialsChatfuelBlockController {
  constructor(
    @repository(ChatfuelCredentialsRepository)
    protected chatfuelCredentialsRepository: ChatfuelCredentialsRepository,
  ) {}

  @get('/chatfuel-credentials/{id}/chatfuel-blocks', {
    responses: {
      '200': {
        description: 'Array of ChatfuelCredentials has many ChatfuelBlock',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(ChatfuelBlock)},
          },
        },
      },
    },
  })
  async find(
    @param.path.number('id') id: number,
    @param.query.object('filter') filter?: Filter<ChatfuelBlock>,
  ): Promise<ChatfuelBlock[]> {
    return this.chatfuelCredentialsRepository.chatfuelBlocks(id).find(filter);
  }

  @post('/chatfuel-credentials/{id}/chatfuel-blocks', {
    responses: {
      '200': {
        description: 'ChatfuelCredentials model instance',
        content: {
          'application/json': {schema: getModelSchemaRef(ChatfuelBlock)},
        },
      },
    },
  })
  async create(
    @param.path.number('id') id: typeof ChatfuelCredentials.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ChatfuelBlock, {
            title: 'NewChatfuelBlockInChatfuelCredentials',
            exclude: ['id'],
            optional: ['chatfuelCredentialsId'],
          }),
        },
      },
    })
    chatfuelBlock: Omit<ChatfuelBlock, 'id'>,
  ): Promise<ChatfuelBlock> {
    return this.chatfuelCredentialsRepository
      .chatfuelBlocks(id)
      .create(chatfuelBlock);
  }

  @patch('/chatfuel-credentials/{id}/chatfuel-blocks', {
    responses: {
      '200': {
        description: 'ChatfuelCredentials.ChatfuelBlock PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ChatfuelBlock, {partial: true}),
        },
      },
    })
    chatfuelBlock: Partial<ChatfuelBlock>,
    @param.query.object('where', getWhereSchemaFor(ChatfuelBlock))
    where?: Where<ChatfuelBlock>,
  ): Promise<Count> {
    return this.chatfuelCredentialsRepository
      .chatfuelBlocks(id)
      .patch(chatfuelBlock, where);
  }

  @del('/chatfuel-credentials/{id}/chatfuel-blocks', {
    responses: {
      '200': {
        description: 'ChatfuelCredentials.ChatfuelBlock DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(ChatfuelBlock))
    where?: Where<ChatfuelBlock>,
  ): Promise<Count> {
    return this.chatfuelCredentialsRepository.chatfuelBlocks(id).delete(where);
  }
}
