import {Entity, model, property} from '@loopback/repository';

@model()
export class ChatfuelBlock extends Entity {
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
  name: string;

  @property({
    type: 'string',
    required: true,
  })
  token: string;

  @property({
    type: 'number',
  })
  chatfuelCredentialsId?: number;

  constructor(data?: Partial<ChatfuelBlock>) {
    super(data);
  }
}

export interface ChatfuelBlockRelations {
  // describe navigational properties here
}

export type ChatfuelBlockWithRelations = ChatfuelBlock & ChatfuelBlockRelations;
