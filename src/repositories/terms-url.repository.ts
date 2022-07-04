import {DefaultCrudRepository} from '@loopback/repository';
import {TermsUrl, TermsUrlRelations} from '../models';
import {DbDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class TermsUrlRepository extends DefaultCrudRepository<
  TermsUrl,
  typeof TermsUrl.prototype.id,
  TermsUrlRelations
> {
  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
  ) {
    super(TermsUrl, dataSource);
  }
}
