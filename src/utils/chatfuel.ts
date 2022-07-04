import {ChatfuelCredentials} from '../models/chatfuel-credentials.model';

export const broadcastApiEndpoint = (
  messengerId: string,
  chatfuelCred: ChatfuelCredentials,
) => {
  const {botId, botToken, chatfuelBlocks} = chatfuelCred;
  return `https://api.chatfuel.com/bots/${botId}/users/${messengerId}/send?chatfuel_token=${botToken}&chatfuel_message_tag=POST_PURCHASE_UPDATE&chatfuel_block_id=${chatfuelBlocks[0].token}`;
};
