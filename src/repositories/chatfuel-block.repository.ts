import {DefaultCrudRepository} from '@loopback/repository';
import {ChatfuelBlock, ChatfuelBlockRelations} from '../models';
import {DbDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class ChatfuelBlockRepository extends DefaultCrudRepository<
  ChatfuelBlock,
  typeof ChatfuelBlock.prototype.id,
  ChatfuelBlockRelations
> {
  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
  ) {
    super(ChatfuelBlock, dataSource);
  }
}
