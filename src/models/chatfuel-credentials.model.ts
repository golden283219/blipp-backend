import {Entity, hasMany, model, property} from '@loopback/repository';
import {ChatfuelBlock} from './chatfuel-block.model';

@model()
export class ChatfuelCredentials extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'string',
    required: true,
  })
  botId: string;

  @property({
    type: 'string',
    required: true,
  })
  botToken: string;

  @hasMany(() => ChatfuelBlock)
  chatfuelBlocks: ChatfuelBlock[];

  @property({
    type: 'number',
  })
  restaurantId?: number;

  constructor(data?: Partial<ChatfuelCredentials>) {
    super(data);
  }
}

export interface ChatfuelCredentialsRelations {
  // describe navigational properties here
}

export type ChatfuelCredentialsWithRelations = ChatfuelCredentials &
  ChatfuelCredentialsRelations;
