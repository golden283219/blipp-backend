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
import {ChatfuelBlock} from '../models';
import {ChatfuelBlockRepository} from '../repositories';
import {AuthorizationRoles} from '../types/jwt';

@authenticate('jwt')
@authorize({
  allowedRoles: [AuthorizationRoles.ADMIN],
})
export class ChatfuelBlockController {
  constructor(
    @repository(ChatfuelBlockRepository)
    public chatfuelBlockRepository: ChatfuelBlockRepository,
  ) {}

  @post('/chatfuel-blocks', {
    responses: {
      '200': {
        description: 'ChatfuelBlock model instance',
        content: {
          'application/json': {schema: getModelSchemaRef(ChatfuelBlock)},
        },
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ChatfuelBlock, {
            title: 'NewChatfuelBlock',
            exclude: ['id'],
          }),
        },
      },
    })
    chatfuelBlock: Omit<ChatfuelBlock, 'id'>,
  ): Promise<ChatfuelBlock> {
    return this.chatfuelBlockRepository.create(chatfuelBlock);
  }

  @get('/chatfuel-blocks/count', {
    responses: {
      '200': {
        description: 'ChatfuelBlock model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.where(ChatfuelBlock) where?: Where<ChatfuelBlock>,
  ): Promise<Count> {
    return this.chatfuelBlockRepository.count(where);
  }

  @get('/chatfuel-blocks', {
    responses: {
      '200': {
        description: 'Array of ChatfuelBlock model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(ChatfuelBlock, {includeRelations: true}),
            },
          },
        },
      },
    },
  })
  async find(
    @param.filter(ChatfuelBlock) filter?: Filter<ChatfuelBlock>,
  ): Promise<ChatfuelBlock[]> {
    return this.chatfuelBlockRepository.find(filter);
  }

  @patch('/chatfuel-blocks', {
    responses: {
      '200': {
        description: 'ChatfuelBlock PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ChatfuelBlock, {partial: true}),
        },
      },
    })
    chatfuelBlock: ChatfuelBlock,
    @param.where(ChatfuelBlock) where?: Where<ChatfuelBlock>,
  ): Promise<Count> {
    return this.chatfuelBlockRepository.updateAll(chatfuelBlock, where);
  }

  @get('/chatfuel-blocks/{id}', {
    responses: {
      '200': {
        description: 'ChatfuelBlock model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(ChatfuelBlock, {includeRelations: true}),
          },
        },
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(ChatfuelBlock, {exclude: 'where'})
    filter?: FilterExcludingWhere<ChatfuelBlock>,
  ): Promise<ChatfuelBlock> {
    return this.chatfuelBlockRepository.findById(id, filter);
  }

  @patch('/chatfuel-blocks/{id}', {
    responses: {
      '204': {
        description: 'ChatfuelBlock PATCH success',
      },
    },
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ChatfuelBlock, {partial: true}),
        },
      },
    })
    chatfuelBlock: ChatfuelBlock,
  ): Promise<void> {
    await this.chatfuelBlockRepository.updateById(id, chatfuelBlock);
  }

  @put('/chatfuel-blocks/{id}', {
    responses: {
      '204': {
        description: 'ChatfuelBlock PUT success',
      },
    },
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() chatfuelBlock: ChatfuelBlock,
  ): Promise<void> {
    await this.chatfuelBlockRepository.replaceById(id, chatfuelBlock);
  }

  @del('/chatfuel-blocks/{id}', {
    responses: {
      '204': {
        description: 'ChatfuelBlock DELETE success',
      },
    },
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.chatfuelBlockRepository.deleteById(id);
  }
}
