import {DefaultCrudRepository, repository, HasManyRepositoryFactory} from '@loopback/repository';
import {ChatfuelCredentials, ChatfuelCredentialsRelations, ChatfuelBlock} from '../models';
import {DbDataSource} from '../datasources';
import {inject, Getter} from '@loopback/core';
import {ChatfuelBlockRepository} from './chatfuel-block.repository';

export class ChatfuelCredentialsRepository extends DefaultCrudRepository<
  ChatfuelCredentials,
  typeof ChatfuelCredentials.prototype.id,
  ChatfuelCredentialsRelations
> {

  public readonly chatfuelBlocks: HasManyRepositoryFactory<ChatfuelBlock, typeof ChatfuelCredentials.prototype.id>;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource, @repository.getter('ChatfuelBlockRepository') protected chatfuelBlockRepositoryGetter: Getter<ChatfuelBlockRepository>,
  ) {
    super(ChatfuelCredentials, dataSource);
    this.chatfuelBlocks = this.createHasManyRepositoryFactoryFor('chatfuelBlocks', chatfuelBlockRepositoryGetter,);
    this.registerInclusionResolver('chatfuelBlocks', this.chatfuelBlocks.inclusionResolver);
  }
}
